import React, {PureComponent} from 'react'

import OverlayContainer from 'src/reusable_ui/components/overlays/OverlayContainer'
import OverlayHeading from 'src/reusable_ui/components/overlays/OverlayHeading'
import OverlayBody from 'src/reusable_ui/components/overlays/OverlayBody'

import {Annotation} from 'src/types'

interface Props {
  annotation: Annotation
  cancel: () => void
}

class AnnotationEditor extends PureComponent<Props> {
  public render() {
    const {cancel} = this.props

    return (
      <div className="annotation-editor">
        <OverlayContainer maxWidth={650}>
          <OverlayHeading title={'Edit Annotation'}>
            <div className="annotation-editor--controls">
              <button className="btn btn-sm btn-default" onClick={cancel}>
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
          <OverlayBody />
        </OverlayContainer>
      </div>
    )
  }

  private get canSave(): boolean {
    return false
  }
}

export default AnnotationEditor
