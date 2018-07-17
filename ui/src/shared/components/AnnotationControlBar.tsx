import React, {PureComponent} from 'react'

class AnnotationControlBar extends PureComponent {
  public render() {
    return (
      <div className="annotation-control-bar">
        <div className="annotation-control-bar--lhs" />
        <div className="annotation-control-bar--rhs">
          <div className="btn btn-primary btn-sm">
            <span className="icon plus" />
            Add Annotation
          </div>
        </div>
      </div>
    )
  }
}

export default AnnotationControlBar
