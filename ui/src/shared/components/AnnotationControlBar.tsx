import React, {PureComponent} from 'react'

class AnnotationControlBar extends PureComponent {
  public render() {
    return (
      <div className="annotation-control-bar">
        <div className="annotation-control-bar--lhs">
          {this.renderEmptyState()}
        </div>
        <div className="annotation-control-bar--rhs">
          <div className="btn btn-primary btn-sm">
            <span className="icon plus" />
            Add Annotation
          </div>
        </div>
      </div>
    )
  }

  private renderEmptyState(): JSX.Element {
    return (
      <div className="annotation-control-bar--empty">
        There are no <strong>Annotation Labels</strong> present in this time
        range
      </div>
    )
  }
}

export default AnnotationControlBar
