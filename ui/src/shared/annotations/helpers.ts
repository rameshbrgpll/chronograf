import {Annotation} from 'src/types'

export const ANNOTATION_MIN_DELTA = 0.5

export const ADDING = 'adding'
export const EDITING = 'editing'

export const TEMP_ANNOTATION: Annotation = {
  id: 'tempAnnotation',
  text: 'Name Me',
  startTime: null,
  endTime: null,
  links: {self: ''},
}

export const visibleAnnotations = (
  xAxisRange: [number, number],
  annotations: Annotation[] = [],
  tempAnnotationID: string
): Annotation[] => {
  const [xStart, xEnd] = xAxisRange

  if (xStart === 0 && xEnd === 0) {
    return []
  }

  return annotations.filter(a => {
    if (a.id === tempAnnotationID) {
      return false
    }
    if (a.startTime === null || a.endTime === null) {
      return false
    }
    if (a.endTime === a.startTime) {
      return xStart <= a.startTime && a.startTime <= xEnd
    }

    return !(a.endTime < xStart || xEnd < a.startTime)
  })
}
