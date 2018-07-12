import React, {Component} from 'react'
import PropTypes from 'prop-types'
import WidgetCell from 'shared/components/WidgetCell'
import LayoutCell from 'shared/components/LayoutCell'
import RefreshingGraph from 'shared/components/RefreshingGraph'
import {buildQueriesForLayouts} from 'utils/buildQueriesForLayouts'
import {IS_STATIC_LEGEND, defaultIntervalValue} from 'src/shared/constants'

import _ from 'lodash'

import {colorsStringSchema} from 'shared/schemas'
import {ErrorHandling} from 'src/shared/decorators/errors'

const getSource = (cell, source, sources, defaultSource) => {
  const s = _.get(cell, ['queries', '0', 'source'], null)
  if (!s) {
    return source
  }

  return sources.find(src => src.links.self === s) || defaultSource
}

@ErrorHandling
class LayoutState extends Component {
  state = {
    cellData: [],
    resolution: defaultIntervalValue,
  }

  grabDataForDownload = cellData => {
    this.setState({cellData})
  }

  handleSeriesResponse = (newSeries, {grabDataForDownload}) => {
    console.log('NEW SERIES IN LAYOUT', newSeries)

    if (grabDataForDownload) {
      this.grabDataForDownload(newSeries)
    }
  }

  render() {
    return (
      <Layout
        {...this.props}
        {...this.state}
        onSeriesResponse={this.handleSeriesResponse}
        onSetResolution={this.handleSetResolution}
      />
    )
  }

  handleSetResolution = resolution => {
    this.setState({resolution})
  }
}

const Layout = (
  {
    host,
    cell,
    cell: {
      h: cellHeight,
      axes,
      type,
      colors,
      legend,
      timeFormat,
      fieldOptions,
      tableOptions,
      decimalPlaces,
    },
    source,
    sources,
    onZoom,
    cellData,
    resolution,
    templates,
    timeRange,
    isEditable,
    isDragging,
    onEditCell,
    onCloneCell,
    autoRefresh,
    manualRefresh,
    onDeleteCell,
    onSetResolution,
    onSeriesResponse,
    onStopAddAnnotation,
    onSummonOverlayTechnologies,
  },
  {source: defaultSource}
) => (
  <LayoutCell
    cell={cell}
    cellData={cellData}
    templates={templates}
    isEditable={isEditable}
    resolution={resolution}
    onEditCell={onEditCell}
    onCloneCell={onCloneCell}
    onDeleteCell={onDeleteCell}
    onSummonOverlayTechnologies={onSummonOverlayTechnologies}
  >
    {cell.isWidget ? (
      <WidgetCell cell={cell} timeRange={timeRange} source={source} />
    ) : (
      <RefreshingGraph
        axes={axes}
        type={type}
        cellHeight={cellHeight}
        onZoom={onZoom}
        colors={colors}
        sources={sources}
        inView={cell.inView}
        timeRange={timeRange}
        templates={templates}
        isDragging={isDragging}
        timeFormat={timeFormat}
        autoRefresh={autoRefresh}
        tableOptions={tableOptions}
        fieldOptions={fieldOptions}
        decimalPlaces={decimalPlaces}
        manualRefresh={manualRefresh}
        onSetResolution={onSetResolution}
        staticLegend={IS_STATIC_LEGEND(legend)}
        onStopAddAnnotation={onStopAddAnnotation}
        queries={buildQueriesForLayouts(cell, timeRange, host)}
        onSeriesResponse={onSeriesResponse}
        source={getSource(cell, source, sources, defaultSource)}
      />
    )}
  </LayoutCell>
)

const {arrayOf, bool, func, number, shape, string} = PropTypes

const propTypes = {
  isDragging: bool,
  autoRefresh: number.isRequired,
  manualRefresh: number,
  timeRange: shape({
    lower: string.isRequired,
  }),
  cell: shape({
    // isWidget cells will not have queries
    isWidget: bool,
    queries: arrayOf(
      shape({
        label: string,
        text: string,
        query: string,
      }).isRequired
    ),
    x: number.isRequired,
    y: number.isRequired,
    w: number.isRequired,
    h: number.isRequired,
    i: string.isRequired,
    name: string.isRequired,
    type: string.isRequired,
    colors: colorsStringSchema,
    tableOptions: shape({
      verticalTimeAxis: bool.isRequired,
      sortBy: shape({
        internalName: string.isRequired,
        displayName: string.isRequired,
        visible: bool.isRequired,
      }).isRequired,
      wrapping: string.isRequired,
      fixFirstColumn: bool.isRequired,
    }),
    timeFormat: string,
    decimalPlaces: shape({
      isEnforced: bool.isRequired,
      digits: number.isRequired,
    }),
    fieldOptions: arrayOf(
      shape({
        internalName: string.isRequired,
        displayName: string.isRequired,
        visible: bool.isRequired,
      }).isRequired
    ),
  }).isRequired,
  templates: arrayOf(shape()),
  host: string,
  source: shape({
    links: shape({
      proxy: string.isRequired,
    }).isRequired,
  }).isRequired,
  onPositionChange: func,
  onEditCell: func,
  onDeleteCell: func,
  onCloneCell: func,
  onSummonOverlayTechnologies: func,
  isStatusPage: bool,
  isEditable: bool,
  onZoom: func,
  sources: arrayOf(shape()),
}

LayoutState.propTypes = {...propTypes}
Layout.propTypes = {
  ...propTypes,
  onSeriesResponse: func,
  cellData: arrayOf(shape({})),
}

export default LayoutState
