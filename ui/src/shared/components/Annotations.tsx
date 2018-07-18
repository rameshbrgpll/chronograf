import React, {Component} from 'react'
import {connect} from 'react-redux'

import AnnotationComponent from 'src/shared/components/Annotation'
import NewAnnotation from 'src/shared/components/NewAnnotation'
import {SourceContext} from 'src/CheckSources'

import {ADDING, TEMP_ANNOTATION} from 'src/shared/annotations/helpers'

import {
  updateAnnotation,
  addingAnnotationSuccess,
  dismissAddingAnnotation,
  mouseEnterTempAnnotation,
  mouseLeaveTempAnnotation,
} from 'src/shared/actions/annotations'
import {visibleAnnotations} from 'src/shared/annotations/helpers'
import {ErrorHandling} from 'src/shared/decorators/errors'

import {Annotation, DygraphClass, Source} from 'src/types'
import {UpdateAnnotationAction} from 'src/types/actions/annotations'
import {AnnotationState} from 'src/shared/reducers/annotations'

interface Props {
  dWidth: number
  staticLegendHeight: number
  annotations: Annotation[]
  mode: string
  xAxisRange: [number, number]
  dygraph: DygraphClass
  isTempHovering: boolean
  handleUpdateAnnotation: (annotation: Annotation) => UpdateAnnotationAction
  handleDismissAddingAnnotation: () => void
  handleAddingAnnotationSuccess: () => void
  handleMouseEnterTempAnnotation: () => void
  handleMouseLeaveTempAnnotation: () => void
}

@ErrorHandling
class Annotations extends Component<Props> {
  public render() {
    const {
      mode,
      dWidth,
      dygraph,
      xAxisRange,
      isTempHovering,
      handleUpdateAnnotation,
      handleDismissAddingAnnotation,
      handleAddingAnnotationSuccess,
      handleMouseEnterTempAnnotation,
      handleMouseLeaveTempAnnotation,
      staticLegendHeight,
    } = this.props
    return (
      <div className="annotations-container">
        {mode === ADDING &&
          this.tempAnnotation && (
            <SourceContext.Consumer>
              {(source: Source) => (
                <NewAnnotation
                  dygraph={dygraph}
                  source={source}
                  isTempHovering={isTempHovering}
                  tempAnnotation={this.tempAnnotation}
                  staticLegendHeight={staticLegendHeight}
                  onUpdateAnnotation={handleUpdateAnnotation}
                  onDismissAddingAnnotation={handleDismissAddingAnnotation}
                  onAddingAnnotationSuccess={handleAddingAnnotationSuccess}
                  onMouseEnterTempAnnotation={handleMouseEnterTempAnnotation}
                  onMouseLeaveTempAnnotation={handleMouseLeaveTempAnnotation}
                />
              )}
            </SourceContext.Consumer>
          )}
        {this.annotations.map(a => (
          <AnnotationComponent
            key={a.id}
            mode={mode}
            xAxisRange={xAxisRange}
            annotation={a}
            dygraph={dygraph}
            dWidth={dWidth}
            staticLegendHeight={staticLegendHeight}
          />
        ))}
      </div>
    )
  }

  get annotations() {
    return visibleAnnotations(
      this.props.xAxisRange,
      this.props.annotations,
      TEMP_ANNOTATION.id
    )
  }

  get tempAnnotation() {
    return this.props.annotations.find(a => a.id === TEMP_ANNOTATION.id)
  }
}

const mstp = ({
  annotations: {annotations, mode, isTempHovering},
}: {
  annotations: AnnotationState
}) => ({
  annotations: Object.values(annotations).filter(a => !!a),
  mode: mode || 'NORMAL',
  isTempHovering,
})

const mdtp = {
  handleAddingAnnotationSuccess: addingAnnotationSuccess,
  handleDismissAddingAnnotation: dismissAddingAnnotation,
  handleMouseEnterTempAnnotation: mouseEnterTempAnnotation,
  handleMouseLeaveTempAnnotation: mouseLeaveTempAnnotation,
  handleUpdateAnnotation: updateAnnotation,
}

export default connect(mstp, mdtp)(Annotations)
