import React, {PureComponent} from 'react'

import OverlayContainer from 'src/reusable_ui/components/overlays/OverlayContainer'
import OverlayHeading from 'src/reusable_ui/components/overlays/OverlayHeading'
import OverlayBody from 'src/reusable_ui/components/overlays/OverlayBody'
import AnnotationEditorBody from 'src/shared/components/AnnotationEditorBody'

import {Annotation} from 'src/types'

interface Props {
  annotation: Annotation
  onCancel: () => void
  onDelete: () => Promise<void>
}

interface State {
  nextAnnotation: Annotation | null
}

class AnnotationEditor extends PureComponent<Props, State> {
  constructor(props) {
    super(props)

    this.state = {nextAnnotation: null}
  }

  public render() {
    const {annotation, onDelete, onCancel} = this.props

    return (
      <div className="annotation-editor">
        <OverlayContainer maxWidth={600}>
          <OverlayHeading title={'Edit Annotation'}>
            <div className="annotation-editor--controls">
              <button className="btn btn-sm btn-default" onClick={onCancel}>
                Cancel
              </button>
              <button
                className="btn btn-sm btn-success"
                disabled={!this.canSave}
              >
                Save
              </button>
            </div>
          </OverlayHeading>
          <OverlayBody>
            <AnnotationEditorBody
              key={annotation.id}
              annotation={annotation}
              onSetNextAnnotation={this.handleSetNextAnnotation}
              onDelete={onDelete}
            />
          </OverlayBody>
        </OverlayContainer>
      </div>
    )
  }

  private get canSave(): boolean {
    return !!this.state.nextAnnotation
  }

  private handleSetNextAnnotation = (
    nextAnnotation: Annotation | null
  ): void => {
    this.setState({nextAnnotation})
  }
}

export default AnnotationEditor
