import uuid from 'uuid'
import {range} from 'lodash'

import AJAX from 'src/utils/ajax'
import {Annotation} from 'src/types'

const msToRFCString = (ms: number) =>
  ms && new Date(Math.round(ms)).toISOString()

const rfcStringToMS = (rfc3339: string) => rfc3339 && Date.parse(rfc3339)

interface ServerAnnotation {
  id: string
  startTime: string
  endTime: string
  text: string
  links: {self: string}
}

const annoToMillisecond = (annotation: ServerAnnotation): Annotation => ({
  ...annotation,
  startTime: rfcStringToMS(annotation.startTime),
  endTime: rfcStringToMS(annotation.endTime),
})

const annoToRFC = (annotation: Annotation): ServerAnnotation => ({
  ...annotation,
  startTime: msToRFCString(annotation.startTime),
  endTime: msToRFCString(annotation.endTime),
})

export const createAnnotation = async (url: string, annotation: Annotation) => {
  const data = annoToRFC(annotation)
  const response = await AJAX({method: 'POST', url, data})
  return annoToMillisecond(response.data)
}

export const getAnnotations = async (
  url: string,
  since: number,
  until: number
) => {
  const {data} = await AJAX({
    method: 'GET',
    url,
    params: {since: msToRFCString(since), until: msToRFCString(until)},
  })
  return data.annotations.map(annoToMillisecond)
}

export const deleteAnnotation = async (annotation: Annotation) => {
  const url = annotation.links.self
  await AJAX({method: 'DELETE', url})
}

export const updateAnnotation = async (annotation: Annotation) => {
  const url = annotation.links.self
  const data = annoToRFC(annotation)
  await AJAX({method: 'PATCH', url, data})
}

const randInt = (min, max) =>
  min + Math.floor(Math.random() * Math.floor(max - min))

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

let fakeAnnotations

export const getAnnotationsFake = async ({
  since,
  until,
  labels = ['foo', 'bar', 'baz'],
}): Promise<Annotation[]> => {
  if (fakeAnnotations) {
    return fakeAnnotations
  }

  if (!until) {
    until = Date.now()
  }

  const numAnnotations = randInt(2, 10)
  const numLabels = randInt(1, labels.length)

  fakeAnnotations = range(0, numAnnotations).map(() => {
    const selectedLabels = [...new Set(range(0, numLabels).map(i => labels[i]))]
    const time = randInt(since, until)

    return {
      id: uuid.v4(),
      startTime: time,
      endTime: time,
      text: 'No Name',
      labels: selectedLabels,
      links: {
        self: '',
      },
    }
  })

  await delay(1000)

  return fakeAnnotations
}
