import React, {SFC, MouseEvent} from 'react'
import moment from 'moment'
import classnames from 'classnames'

import {Annotation} from 'src/types'

interface TimeStampProps {
  time: number
}

const TimeStamp: SFC<TimeStampProps> = ({time}) => (
  <div className="annotation-tooltip--timestamp">
    {`${moment(time).format('YYYY/MM/DD HH:mm:ss.SS')}`}
  </div>
)

interface AnnotationState {
  isDragging: string | boolean
  isMouseOver: string | boolean
}

interface Props {
  annotation: Annotation
  timestamp: number
  onMouseLeave: (e: MouseEvent<HTMLDivElement>) => void
  annotationState: AnnotationState
}

const AnnotationTooltip: SFC<Props> = props => {
  const {
    annotation,
    onMouseLeave,
    timestamp,
    annotationState: {isDragging, isMouseOver},
  } = props

  const tooltipClass = classnames('annotation-tooltip', {
    hidden: !(isDragging || isMouseOver),
  })

  return (
    <div
      id={`tooltip-${annotation.id}`}
      onMouseLeave={onMouseLeave}
      className={tooltipClass}
    >
      {isDragging ? (
        <TimeStamp time={timestamp} />
      ) : (
        <div className="annotation-tooltip--items">
          <div>{annotation.text}</div>
          <TimeStamp time={timestamp} />
        </div>
      )}
    </div>
  )
}

export default AnnotationTooltip
