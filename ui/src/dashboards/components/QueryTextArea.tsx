import React, {Component} from 'react'
import _ from 'lodash'
import classnames from 'classnames'

import TemplateDrawer from 'src/shared/components/TemplateDrawer'
import QueryStatus from 'src/shared/components/QueryStatus'
import {ErrorHandling} from 'src/shared/decorators/errors'
import {
  Controlled as ReactCodeMirror,
  IInstance,
  Controlled,
} from 'react-codemirror2'

import {Template, QueryConfig} from 'src/types'

import {
  MATCH_INCOMPLETE_TEMPLATES,
  applyMasks,
  insertTempVar,
  unMask,
} from 'src/tempVars/constants'
import {start} from 'repl'

interface State {
  value: string
  isTemplating: boolean
  selectedTemplate: {
    tempVar: string
  }
  filteredTemplates: Template[]
}

interface Props {
  query: string
  onUpdate: (text: string) => void
  config: QueryConfig
  isInDataExplorer?: boolean
  templates: Template[]
}

const CODE_MIRROR_OPTIONS = {
  tabIndex: 1,
  mode: 'influxQL',
  readonly: false,
  lineNumbers: false,
  autoRefresh: true,
  theme: 'influxql',
  completeSingle: false,
  lineWrapping: true,
}

@ErrorHandling
class QueryTextArea extends Component<Props, State> {
  private textArea: React.RefObject<Controlled>

  constructor(props: Props) {
    super(props)
    this.textArea = React.createRef()
    this.state = {
      value: this.props.query,
      isTemplating: false,
      selectedTemplate: {
        tempVar: _.get(this.props.templates, ['0', 'tempVar'], ''),
      },
      filteredTemplates: this.props.templates,
    }
  }

  public render() {
    const {
      config: {status},
    } = this.props
    const {
      value,
      isTemplating,
      selectedTemplate,
      filteredTemplates,
    } = this.state

    return (
      <div className="query-editor">
        <ReactCodeMirror
          className="query-editor--field"
          autoFocus={true}
          autoCursor={true}
          value={value}
          options={CODE_MIRROR_OPTIONS}
          onChange={this.handleChange}
          onBlur={this.handleUpdate}
          onBeforeChange={this.updateCode}
          onTouchStart={() => {}}
          onKeyDown={this.handleKeyDown}
        />

        <div
          className={classnames('varmoji', {'varmoji-rotated': isTemplating})}
        >
          <div className="varmoji-container">
            <div className="varmoji-front">
              <QueryStatus status={status} />
            </div>
            <div className="varmoji-back">
              {isTemplating ? (
                <TemplateDrawer
                  onClickTempVar={this.handleClickTempVar}
                  templates={filteredTemplates}
                  selected={selectedTemplate}
                  onMouseOverTempVar={this.handleMouseOverTempVar}
                  handleClickOutside={this.handleCloseDrawer}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    )
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (this.props.query !== nextProps.query) {
      this.setState({value: nextProps.query})
    }
  }

  private handleCloseDrawer = () => {
    this.setState({isTemplating: false})
  }

  private handleMouseOverTempVar = (template: Template) => () => {
    this.handleTemplateReplace(template, false)
  }

  private handleClickTempVar = (template: Template) => () => {
    // Clicking a tempVar does the same thing as hitting 'Enter'
    this.handleTemplateReplace(template, true)
    this.closeDrawer()
  }

  private closeDrawer = () => {
    this.setState({
      isTemplating: false,
      selectedTemplate: {
        tempVar: _.get(this.props.templates, ['0', 'tempVar'], ''),
      },
    })
  }

  private handleKeyDown = (editor, e) => {
    const {isTemplating, value} = this.state

    if (isTemplating) {
      switch (e.key) {
        case 'Tab':
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault()
          return this.handleTemplateReplace(
            editor,
            this.findTempVar('next'),
            false
          )
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault()
          return this.handleTemplateReplace(
            editor,
            this.findTempVar('previous'),
            false
          )
        case 'Enter':
          e.preventDefault()
          this.handleTemplateReplace(editor, this.state.selectedTemplate, true)
          return this.closeDrawer()
        case 'Escape':
          e.preventDefault()
          return this.closeDrawer()
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      this.setState({value, isTemplating: false})
    } else if (e.key === 'Enter') {
      e.preventDefault()
      this.handleUpdate()
    }
  }

  private handleTemplateReplace = (
    editor,
    selectedTemplate,
    replaceWholeTemplate
  ) => {
    const start = editor.getCursor()
    const value = this.state.value
    console.log(editor.getSelection())
    const {tempVar} = selectedTemplate
    const newTempVar = replaceWholeTemplate
      ? tempVar
      : tempVar.substring(0, tempVar.length - 1)

    // mask matches that will confuse our regex
    const masked = applyMasks(value)
    const matched = masked.match(MATCH_INCOMPLETE_TEMPLATES)

    let templatedValue
    if (matched) {
      templatedValue = insertTempVar(masked, newTempVar)
      templatedValue = unMask(templatedValue)
    }

    const enterModifier = replaceWholeTemplate ? 0 : -1
    const diffInLength =
      tempVar.length - _.get(matched, '0', []).length + enterModifier

    const end = {line: start.line, ch: start.ch + tempVar.length}
    this.setState({value: templatedValue, selectedTemplate}, () => {
      editor.setSelection(end, start)
    })
  }

  private findTempVar = direction => {
    const {filteredTemplates: templates} = this.state
    const {selectedTemplate} = this.state

    const i = _.findIndex(templates, selectedTemplate)
    const lastIndex = templates.length - 1

    if (i >= 0) {
      if (direction === 'next') {
        return templates[(i + 1) % templates.length]
      }

      if (direction === 'previous') {
        if (i === 0) {
          return templates[lastIndex]
        }

        return templates[i - 1]
      }
    }

    return templates[0]
  }

  private handleChange = (editor, data, value) => {
    const {templates} = this.props
    const {selectedTemplate} = this.state

    // mask matches that will confuse our regex
    const masked = applyMasks(value)
    const matched = masked.match(MATCH_INCOMPLETE_TEMPLATES)

    if (matched && !_.isEmpty(templates)) {
      // maintain cursor poition
      // const start = editor.selectionStart

      // const end = editor.selectionEnd
      const filterText = matched[0].substr(1).toLowerCase()

      const filteredTemplates = templates.filter(t =>
        t.tempVar.toLowerCase().includes(filterText)
      )

      const found = filteredTemplates.find(
        t => selectedTemplate && t.tempVar === selectedTemplate.tempVar
      )
      const newTemplate = found ? found : filteredTemplates[0]

      this.setState({
        isTemplating: true,
        selectedTemplate: newTemplate,
        filteredTemplates,
        value,
      })
      // editor.setSelectionRange(start, end)
    } else {
      this.setState({isTemplating: false, value})
    }
  }

  private handleUpdate = () => {
    this.props.onUpdate(this.state.value)
  }

  private updateCode = (
    _: IInstance,
    __: EditorChange,
    value: string
  ): void => {
    this.setState({value})
  }
}

export default QueryTextArea
