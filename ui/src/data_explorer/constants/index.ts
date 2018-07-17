export const INFLUXQL_FUNCTIONS: string[] = [
  'mean',
  'median',
  'count',
  'min',
  'max',
  'sum',
  'first',
  'last',
  'spread',
  'stddev',
]

interface MinHeights {
  queryMaker: number
  visualization: number
}

export const MINIMUM_HEIGHTS: MinHeights = {
  queryMaker: 350,
  visualization: 200,
}

interface InitialHeights {
  queryMaker: '66.666%'
  visualization: '33.334%'
}

export const INITIAL_HEIGHTS: InitialHeights = {
  queryMaker: '66.666%',
  visualization: '33.334%',
}

const SEPARATOR: string = 'SEPARATOR'

export interface QueryTemplate {
  text: string
  query: string
}

interface Separator {
  text: string
}

type Template = QueryTemplate | Separator

export const SEPARATOR_TEMPLATE: Separator = {
  text: 'SEPERATOR',
}

export const SHOW_QUERY_TEMPLATE_VALUES = {
  text: 'SHOW RAW QUERY',
}

export const HIDE_QUERY_TEMPLATE_VALUES = {
  text: 'HIDE RAW QUERY',
}

export type QueryTemplateList = Template[]

export const QUERY_TEMPLATES: QueryTemplateList = [
  {
    text: 'Show Databases',
    query: 'SHOW DATABASES',
  },
  {
    text: 'Create Database',
    query: 'CREATE DATABASE "db_name"',
  },
  {
    text: 'Drop Database',
    query: 'DROP DATABASE "db_name"',
  },
  SEPARATOR_TEMPLATE,
  {
    text: 'Show Measurements',
    query: 'SHOW MEASUREMENTS ON "db_name"',
  },
  {
    text: 'Show Tag Keys',
    query: 'SHOW TAG KEYS ON "db_name" FROM "measurement_name"',
  },
  {
    text: 'Show Tag Values',
    query:
      'SHOW TAG VALUES ON "db_name" FROM "measurement_name" WITH KEY = "tag_key"',
  },
  SEPARATOR_TEMPLATE,
  {
    text: 'Show Retention Policies',
    query: 'SHOW RETENTION POLICIES on "db_name"',
  },
  {
    text: 'Create Retention Policy',
    query:
      'CREATE RETENTION POLICY "rp_name" ON "db_name" DURATION 30d REPLICATION 1 DEFAULT',
  },
  {
    text: 'Drop Retention Policy',
    query: 'DROP RETENTION POLICY "rp_name" ON "db_name"',
  },
  SEPARATOR_TEMPLATE,
  {
    text: 'Show Continuous Queries',
    query: 'SHOW CONTINUOUS QUERIES',
  },
  {
    text: 'Create Continuous Query',
    query:
      'CREATE CONTINUOUS QUERY "cq_name" ON "db_name" BEGIN SELECT min("field") INTO "target_measurement" FROM "current_measurement" GROUP BY time(30m) END',
  },
  {
    text: 'Drop Continuous Query',
    query: 'DROP CONTINUOUS QUERY "cq_name" ON "db_name"',
  },
  SEPARATOR_TEMPLATE,
  {
    text: 'Show Users',
    query: 'SHOW USERS',
  },
  {
    text: 'Create User',
    query: 'CREATE USER "username" WITH PASSWORD \'password\'',
  },
  {
    text: 'Create Admin User',
    query:
      'CREATE USER "username" WITH PASSWORD \'password\' WITH ALL PRIVILEGES',
  },
  {
    text: 'Drop User',
    query: 'DROP USER "username"',
  },
  SEPARATOR_TEMPLATE,
  {
    text: 'Show Stats',
    query: 'SHOW STATS',
  },
  {
    text: 'Show Diagnostics',
    query: 'SHOW DIAGNOSTICS',
  },
]

export const WRITE_DATA_DOCS_LINK =
  'https://docs.influxdata.com/influxdb/latest/write_protocols/line_protocol_tutorial/'
