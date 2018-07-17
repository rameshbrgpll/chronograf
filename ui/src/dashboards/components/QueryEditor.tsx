import React, {Component} from 'react'
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
  value: string
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

@ErrorHandling
class QueryEditor extends Component<Props, State> {
  private editor: IInstance

  constructor(props: Props) {
    super(props)
    this.editor = null

    this.state = {
      focused: false,
      value: this.props.query,
      editorValue: this.props.query,
      isTemplating: false,
      isShowingTemplateValues: false,
      selectedTemplate: this.defaultSelectedTemplate,
      filteredTemplates: this.props.templates,
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
      focused: isShowingTemplateValues,
    }

    return (
      <div className="query-editor">
        <div className={this.queryCodeClassName}>
          <ReactCodeMirror
            className="query-editor--field"
            autoFocus={true}
            autoCursor={true}
            value={editorValue}
            options={options}
            onChange={this.handleChange}
            onBlur={this.handleBlur}
            onFocus={this.handleFocus}
            onBeforeChange={this.updateCode}
            onTouchStart={NOOP}
            onKeyDown={this.handleKeyDown}
            editorDidMount={this.setEditor}
          />
        </div>
        <div
          className={classnames('varmoji', {'varmoji-rotated': isTemplating})}
        >
          <div className="varmoji-container">
            <div className="varmoji-front">
              <QueryStatus status={status}>
                <button
                  className={classnames('btn btn-xs btn-info', {
                    disabled: isTemplating,
                  })}
                  onClick={this.handleToggleTemplateValues}
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

  public componentWillReceiveProps(nextProps: Props) {
    if (this.props.query !== nextProps.query) {
      this.setQueryValue(nextProps.query)
    }
  }

  private handleToggleTemplateValues = (): void => {
    const {isShowingTemplateValues} = this.state

    if (isShowingTemplateValues) {
      this.setQueryValue(this.state.value)
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
    const {value: queryText} = this.state

    const queryWithTemplateValues = await replaceQueryTemplates(
      queryText,
      this.props.config.source,
      this.props.templates,
      NULL_RESOLUTION
    )

    this.setState({
      editorValue: queryWithTemplateValues,
      isShowingTemplateValues: true,
      focused: true,
    })
  }

  private setQueryValue(value: string) {
    this.setState({
      isTemplating: false,
      isShowingTemplateValues: false,
      selectedTemplate: this.defaultSelectedTemplate,
      filteredTemplates: this.props.templates,
      editorValue: value,
      value,
    })
  }

  private handleBlur = (): void => {
    this.setState({focused: false})

    if (this.state.isShowingTemplateValues) {
      this.setQueryValue(this.state.value)
    }

    this.handleUpdate()
  }

  private handleFocus = (): void => {
    this.setState({focused: true})
  }

  private get defaultSelectedTemplate() {
    return {
      tempVar: _.get(this.props.templates, ['0', 'tempVar'], ''),
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

  private closeDrawer = () => {
    this.setState({
      isTemplating: false,
      selectedTemplate: this.defaultSelectedTemplate,
    })
  }

  private setEditor = editor => {
    this.editor = editor
  }

  private handleKeyDown = (__, e) => {
    const {isTemplating, value} = this.state

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
      this.setState({value, isTemplating: false})
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

    let templatedValue
    if (matched) {
      templatedValue = insertTempVar(masked, newTempVar)
      templatedValue = unMask(templatedValue)
    }

    const enterModifier = replaceWholeTemplate ? 0 : -1

    const startIndex = TEMPLATE_START + masked.indexOf(_.get(matched, '0'))
    const tempVarLength = newTempVar.length + enterModifier

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
      {editorValue: templatedValue, selectedTemplate, value: templatedValue},
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
    const isChanged = value !== this.state.value

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
        value,
      })
    } else {
      this.setState({isTemplating: false, value})
    }
  }

  private handleUpdate = () => {
    if (!this.isDisabled) {
      this.props.onUpdate(this.state.value)
    }
  }

  private updateCode = (
    __: IInstance,
    ___: EditorChange,
    value: string
  ): void => {
    this.setState({editorValue: value})
  }
}

export default QueryEditor
