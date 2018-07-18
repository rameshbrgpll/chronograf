import React, {PureComponent, ChangeEvent} from 'react'

import RadioButtons from 'src/reusable_ui/components/radio_buttons/RadioButtons'
import ConfirmButton from 'src/shared/components/ConfirmButton'

import Debouncer from 'src/shared/utils/debouncer'

import {Annotation} from 'src/types'

const INPUT_DEBOUNCE_TIME = 400

interface Props {
  annotation: Annotation
  onSetNextAnnotation: (nextAnnotation: Annotation) => void
  onDelete: () => Promise<void>
}

interface State {
  text: string
  type: 'point' | 'window'
  startTime: string
  endTime: string
  labels: string[]

  startTimeInput: string
  startTimeError: string | null
}

class AnnotationEditorBody extends PureComponent<Props, State> {
  private debouncer: Debouncer

  constructor(props) {
    super(props)

    this.debouncer = new Debouncer()

    const {text, startTime, endTime, labels} = props.annotation
    const type = startTime === endTime ? 'point' : 'window'

    this.state = {
      text,
      startTime,
      endTime,
      labels,
      type,
      startTimeInput: startTime,
      startTimeError: null,
    }
  }

  public componentWillUnmount() {
    this.debouncer.cancelAll()
  }

  public render() {
    const {onDelete} = this.props
    const {text, type, endTime, startTimeInput} = this.state

    return (
      <div className="annotation-editor-body">
        <div className="row">
          <div className="form-group col-xs-6">
            <label>Name</label>
            <input type="text" className="form-control input-sm" value={text} />
          </div>
          <div className="form-group col-xs-6">
            <label>Type</label>
            <RadioButtons
              buttons={['point', 'window']}
              activeButton={type}
              onChange={this.handleTypeChange}
            />
          </div>
        </div>
        <div className="row">
          <div className="form-group col-xs-6">
            <label>Start</label>
            <input
              type="text"
              className="form-control input-sm"
              value={startTimeInput}
              onChange={this.handleStartTimeInputChange}
            />
          </div>
          <div className="form-group col-xs-6">
            <label>End</label>
            <input
              type="text"
              className="form-control input-sm"
              value={endTime}
            />
          </div>
        </div>
        <div className="row">
          <div className="form-group col-xs-12">
            <label>Groups</label>
            <input type="text" className="form-control input-sm" />
          </div>
        </div>
        <div className="row">
          <ConfirmButton
            text={'Delete'}
            confirmAction={onDelete}
            type="btn-danger"
            customClass={'annotation-editor-body--delete'}
            size="btn-xs"
          />
        </div>
      </div>
    )
  }

  private handleTypeChange = type => {
    this.setState({type})
  }

  private handleStartTimeInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({startTimeInput: e.target.value})

    this.debouncer.call(this.changeStartTime, INPUT_DEBOUNCE_TIME)
  }

  private changeStartTime = () => {
    // validate input
    // if valid, update nextAnnotation and sync with starttime
    // otherwise set error
  }
}

export default AnnotationEditorBody
