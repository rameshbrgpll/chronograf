import React, {PureComponent} from 'react'
import {withRouter} from 'react-router'
import {connect} from 'react-redux'

import FluxForm from 'src/flux/components/FluxForm'
import {ErrorHandling} from 'src/shared/decorators/errors'
import {getService} from 'src/shared/apis'

import {Service, Source} from 'src/types'

interface Props {
  services: Service[]
  source: Source
  params: {id: string; sourceID: string}
}

interface State {
  service: Service
}

@ErrorHandling
class FluxConnectionPage extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      service: null,
    }
  }

  public async componentDidMount() {
    const {
      source,
      params: {id},
    } = this.props
    const service = await getService(source.links.self, id)
    this.setState({service})
  }

  public render() {
    const {services} = this.props
    const {service} = this.state

    return (
      <FluxForm
        service={services[0]}
        mode={'edit'}
        onSubmit={this.handleSubmit}
        onInputChange={this.handleInputChange}
      />
    )
  }

  private handleSubmit = () => {
    console.log('submit!')
  }

  private handleInputChange = () => {
    console.log('chaaaange')
  }
}

const mapStateToProps = ({services}) => ({services})

export default connect(mapStateToProps, null)(withRouter(FluxConnectionPage))
