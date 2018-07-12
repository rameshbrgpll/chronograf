import React, {Component, ComponentClass} from 'react'
import _ from 'lodash'

import {fetchTimeSeries} from 'src/shared/apis/query'
import {DEFAULT_TIME_SERIES} from 'src/shared/constants/series'
import {TimeSeriesServerResponse} from 'src/types/series'
import {Template, Source} from 'src/types'

interface Axes {
  bounds: {
    y: number[]
    y2: number[]
  }
}

interface Query {
  text: string
  database: string
  db: string
  rp: string
  id: string
}

export interface Props {
  source: Source
  axes: Axes
  type: string
  inView: boolean
  queries: Query[]
  autoRefresh: number
  templates: Template[]
  editQueryStatus: () => void
  onSetResolution?: (resolution: number) => void
  grabDataForDownload: (timeSeries: TimeSeriesServerResponse[]) => void
}

interface State {
  isFetching: boolean
  isLastQuerySuccessful: boolean
  timeSeries: TimeSeriesServerResponse[]
  resolution: number | null
}

export interface OriginalProps {
  data: TimeSeriesServerResponse[]
  setResolution: (resolution: number) => void
  isFetchingInitially?: boolean
  isRefreshing?: boolean
}

const AutoRefresh = (
  ComposedComponent: ComponentClass<OriginalProps & Props>
) => {
  class Wrapper extends Component<Props, State> {
    public static defaultProps = {
      inView: true,
    }

    private intervalID: number

    constructor(props: Props) {
      super(props)
      this.state = {
        isFetching: false,
        isLastQuerySuccessful: true,
        timeSeries: DEFAULT_TIME_SERIES,
        resolution: null,
      }
    }

    public async componentDidMount() {
      this.startNewPolling()
    }

    public async componentDidUpdate(prevProps: Props) {
      if (!this.isPropsDifferent(prevProps)) {
        return
      }
      this.startNewPolling()
    }

    public executeQueries = async () => {
      const {
        source,
        editQueryStatus,
        grabDataForDownload,
        inView,
        queries,
      } = this.props
      const {resolution} = this.state

      if (!inView) {
        return
      }

      if (!queries.length) {
        this.setState({timeSeries: DEFAULT_TIME_SERIES})
        return
      }

      this.setState({isFetching: true})
      const templates: Template[] = _.get(this.props, 'templates', [])

      try {
        const newSeries = await fetchTimeSeries(
          source,
          queries,
          resolution,
          templates,
          editQueryStatus
        )

        const isLastQuerySuccessful = this.hasResultsForQuery(newSeries)

        this.setState({
          timeSeries: newSeries,
          isLastQuerySuccessful,
          isFetching: false,
        })

        if (grabDataForDownload) {
          grabDataForDownload(newSeries)
        }
      } catch (err) {
        console.error(err)
      }
    }

    public componentWillUnmount() {
      this.clearInterval()
    }

    public render() {
      const {timeSeries, isFetching, isLastQuerySuccessful} = this.state

      const hasValues = _.some(timeSeries, s => {
        const results = _.get(s, 'response.results', [])
        const v = _.some(results, r => r.series)
        return v
      })

      if (!hasValues) {
        return (
          <div className="graph-empty">
            <p>No Results</p>
          </div>
        )
      }

      if (isFetching && isLastQuerySuccessful) {
        return (
          <ComposedComponent
            {...this.props}
            data={timeSeries}
            setResolution={this.setResolution}
            isFetchingInitially={false}
            isRefreshing={true}
          />
        )
      }

      return (
        <ComposedComponent
          {...this.props}
          data={timeSeries}
          setResolution={this.setResolution}
        />
      )
    }

    private setResolution = (resolution: number) => {
      const {onSetResolution} = this.props
      if (resolution !== this.state.resolution) {
        this.setState({resolution})
        if (onSetResolution) {
          onSetResolution(resolution)
        }
      }
    }

    private clearInterval() {
      if (!this.intervalID) {
        return
      }

      clearInterval(this.intervalID)
      this.intervalID = null
    }

    private isPropsDifferent(nextProps: Props) {
      const isSourceDifferent = !_.isEqual(this.props.source, nextProps.source)

      return (
        this.props.inView !== nextProps.inView ||
        !!this.queryDifference(this.props.queries, nextProps.queries).length ||
        !_.isEqual(this.props.templates, nextProps.templates) ||
        this.props.autoRefresh !== nextProps.autoRefresh ||
        isSourceDifferent
      )
    }

    private startNewPolling() {
      this.clearInterval()

      const {autoRefresh} = this.props

      this.executeQueries()

      if (autoRefresh) {
        this.intervalID = window.setInterval(this.executeQueries, autoRefresh)
      }
    }

    private queryDifference = (left, right) => {
      const mapper = q => `${q.text}`
      const leftStrs = left.map(mapper)
      const rightStrs = right.map(mapper)
      return _.difference(
        _.union(leftStrs, rightStrs),
        _.intersection(leftStrs, rightStrs)
      )
    }

    private hasResultsForQuery = (data): boolean => {
      if (!data.length) {
        return false
      }

      data.every(({resp}) =>
        _.get(resp, 'results', []).every(r => Object.keys(r).length > 1)
      )
    }
  }

  return Wrapper
}

export default AutoRefresh
