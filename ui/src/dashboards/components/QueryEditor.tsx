import React, {Component, MouseEvent} from 'react'
import _ from 'lodash'
import classnames from 'classnames'

import TemplateDrawer from 'src/shared/components/TemplateDrawer'
import QueryStatus from 'src/shared/components/QueryStatus'
import {ErrorHandling} from 'src/shared/decorators/errors'
import {Controlled as ReactCodeMirror, IInstance} from 'react-codemirror2'
import {replace as replaceQueryTemplates} from 'src/shared/apis/query'

import {Template, QueryConfig} from 'src/types'
import {EditorChange} from 'codemirror'

import {
  MATCH_INCOMPLETE_TEMPLATES,
  applyMasks,
  insertTempVar,
  unMask,
} from 'src/tempVars/constants'

interface State {
  focused: boolean
  queryText: string
  editorValue: string
  isTemplating: boolean
  selectedTemplate: {
    tempVar: string
  }
  isShowingTemplateValues: boolean
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

const TEMPLATE_START = ':'.length

const NOOP = () => {}
const NULL_RESOLUTION = null
const SHOW_TEMPLATES = 'Show Raw Query'
const HIDE_TEMPLATES = 'Hide Raw Query'

const BLURRED_EDITOR_STATE = {
  focused: false,
  isTemplating: false,
  isShowingTemplateValues: false,
}

@ErrorHandling
class QueryEditor extends Component<Props, State> {
  public static getDerivedStateFromProps(nextProps: Props, prevState: State) {
    if (prevState.editorValue !== nextProps.query) {
      return {
        ...BLURRED_EDITOR_STATE,
        selectedTemplate: {
          tempVar: _.get(nextProps.templates, ['0', 'tempVar'], ''),
        },
        filteredTemplates: nextProps.templates,
        editorValue: nextProps.query,
        queryText: nextProps.query,
      }
    }

    return null
  }

  private editor?: IInstance

  constructor(props: Props) {
    super(props)

    this.editor = null

    this.state = {
      ...BLURRED_EDITOR_STATE,
      selectedTemplate: {
        tempVar: _.get(props.templates, ['0', 'tempVar'], ''),
      },
      filteredTemplates: props.templates,
      editorValue: props.query,
      queryText: props.query,
    }
  }

  public render() {
    const {
      config: {status},
    } = this.props

    const {
      editorValue,
      isTemplating,
      selectedTemplate,
      filteredTemplates,
      isShowingTemplateValues,
    } = this.state

    const options = {
      ...CODE_MIRROR_OPTIONS,
      readOnly: isShowingTemplateValues,
    }

    return (
      <div className="query-editor">
        <div className={this.queryCodeClassName}>
          <ReactCodeMirror
            className="query-editor--field"
            autoFocus={true}
            autoCursor={true}
            options={options}
            onTouchStart={NOOP}
            value={editorValue}
            onChange={this.handleChange}
            onBlur={this.handleBlurEditor}
            onFocus={this.handleFocusEditor}
            onKeyDown={this.handleKeyDownEditor}
            onDblClick={this.handleUnmountEditor}
            editorDidMount={this.handleMountEditor}
            onBeforeChange={this.handleUpdateEditorValue}
          />
        </div>
        <div
          className={classnames('varmoji', {'varmoji-rotated': isTemplating})}
        >
          <div className="varmoji-container">
            <div className="varmoji-front">
              <QueryStatus status={status}>
                <button
                  onMouseDown={this.handleToggleFocus}
                  onClick={this.handleToggleTemplateValues}
                  className={classnames('btn btn-xs btn-info', {
                    disabled: isTemplating,
                  })}
                >
                  {this.templateToggleStatus}
                </button>
                <button
                  className={classnames(
                    'btn btn-xs btn-primary query-editor--submit',
                    {disabled: this.isDisabled}
                  )}
                  onClick={this.handleUpdate}
                >
                  Submit Query
                </button>
              </QueryStatus>
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

  private hideTemplateValues = (): void => {
    this.setQueryValue(this.state.queryText)
  }

  private handleToggleFocus = (e: MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation()
    e.preventDefault()

    this.editor.focus()
  }

  private handleToggleTemplateValues = (): void => {
    const {isShowingTemplateValues} = this.state

    if (isShowingTemplateValues) {
      this.hideTemplateValues()
    } else {
      this.showTemplateValues()
    }
  }

  private get isDisabled(): boolean {
    return this.state.isTemplating || this.state.isShowingTemplateValues
  }

  private get queryCodeClassName(): string {
    const {focused} = this.state

    return classnames('query-editor--code', {focus: focused})
  }

  private get templateToggleStatus(): string {
    if (this.state.isShowingTemplateValues) {
      return HIDE_TEMPLATES
    }

    return SHOW_TEMPLATES
  }

  private showTemplateValues = async (): Promise<void> => {
    const {queryText} = this.state

    const queryWithTemplateValues = await replaceQueryTemplates(
      queryText,
      this.props.config.source,
      this.props.templates,
      NULL_RESOLUTION
    )

    this.setState({
      editorValue: queryWithTemplateValues,
      isShowingTemplateValues: true,
    })

    if (this.editor) {
      this.editor.focus()
    }
  }

  private handleCloseDrawer = (): void => {
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

  private handleMountEditor = (editor: IInstance) => {
    this.editor = editor
  }

  private handleUnmountEditor = () => {
    this.editor = null
  }

  private handleBlurEditor = (): void => {
    this.setState({focused: false})

    this.hideTemplateValues()
  }

  private handleFocusEditor = (): void => {
    this.setState({focused: true})
  }

  private handleKeyDownEditor = (__, e) => {
    const {isTemplating, queryText} = this.state

    if (isTemplating) {
      switch (e.key) {
        case 'Tab':
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault()
          return this.handleTemplateReplace(this.findTempVar('next'), false)
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault()
          return this.handleTemplateReplace(this.findTempVar('previous'), false)
        case 'Enter':
          e.preventDefault()
          this.handleTemplateReplace(this.state.selectedTemplate, true)
          return this.closeDrawer()
        case 'Escape':
          e.preventDefault()
          return this.closeDrawer()
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      this.setState({queryText, isTemplating: false})
    } else if (e.key === 'Enter') {
      e.preventDefault()
      this.handleUpdate()
    }
  }

  private handleTemplateReplace = (selectedTemplate, replaceWholeTemplate) => {
    const start = this.editor.getCursor()
    const editorValue = this.state.editorValue

    const {tempVar} = selectedTemplate
    const newTempVar = replaceWholeTemplate
      ? tempVar
      : tempVar.substring(0, tempVar.length - 1)

    // mask matches that will confuse our regex
    const masked = applyMasks(editorValue)
    const matched = masked.match(MATCH_INCOMPLETE_TEMPLATES)

    let templatedEditorValue
    if (matched) {
      templatedEditorValue = insertTempVar(masked, newTempVar)
      templatedEditorValue = unMask(templatedEditorValue)
    }

    const enterModifier = replaceWholeTemplate ? 1 : 0
    const startIndex =
      TEMPLATE_START + masked.indexOf(_.get(matched, '0')) - enterModifier
    const tempVarLength = newTempVar.length - TEMPLATE_START + enterModifier

    let templateStart = start
    let templateEnd = start

    if (matched) {
      templateStart = {
        line: start.line,
        ch: startIndex,
      }

      templateEnd = {
        line: start.line,
        ch: startIndex + tempVarLength,
      }
    }

    this.setState(
      {
        editorValue: templatedEditorValue,
        selectedTemplate,
        queryText: templatedEditorValue,
      },
      () => {
        this.editor.setSelection(templateEnd, templateStart)
      }
    )
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

  private handleChange = (
    __: IInstance,
    ___: EditorChange,
    value: string
  ): void => {
    const {templates} = this.props
    const {selectedTemplate} = this.state
    const isChanged = value !== this.state.queryText

    if (!isChanged || this.state.isShowingTemplateValues) {
      return
    }

    // mask matches that will confuse our regex
    const masked = applyMasks(value)
    const matched = masked.match(MATCH_INCOMPLETE_TEMPLATES)

    if (matched && !_.isEmpty(templates)) {
      // maintain cursor poition

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
        editorValue: value,
        selectedTemplate: newTemplate,
        filteredTemplates,
        queryText: value,
      })
    } else {
      this.setState({isTemplating: false, queryText: value})
    }
  }

  private handleUpdate = () => {
    if (!this.isDisabled) {
      this.props.onUpdate(this.state.queryText)
    }
  }

  private setQueryValue(queryText: string) {
    const queryDefaultState = {
      ...BLURRED_EDITOR_STATE,
      selectedTemplate: {
        tempVar: _.get(this.props.templates, ['0', 'tempVar'], ''),
      },
      filteredTemplates: this.props.templates,
      editorValue: queryText,
      queryText,
    }

    this.setState(queryDefaultState)
  }

  private closeDrawer = () => {
    this.setState({
      isTemplating: false,
      selectedTemplate: {
        tempVar: _.get(this.props.templates, ['0', 'tempVar'], ''),
      },
    })
  }

  private handleUpdateEditorValue = (
    __: IInstance,
    ___: EditorChange,
    value: string
  ): void => {
    this.setState({editorValue: value})
  }
}

export default QueryEditor
