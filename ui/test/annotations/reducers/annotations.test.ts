import reducer from 'src/shared/reducers/annotations'
import {Annotation} from 'src/types'
import {AnnotationState} from 'src/shared/reducers/annotations'

import {
  addAnnotation,
  deleteAnnotation,
  loadAnnotations,
  updateAnnotation,
} from 'src/shared/actions/annotations'

const a1: Annotation = {
  id: '1',
  startTime: 1515716169000,
  endTime: 1515716169000,
  text: 'you have no swoggels',
  links: {self: 'to/thine/own/self/be/true'},
}

const a2: Annotation = {
  id: '2',
  startTime: 1515716169000,
  endTime: 1515716169002,
  text: 'you have so many swoggels',
  links: {self: 'self/in/eye/of/beholder'},
}

const state: AnnotationState = {
  isTempHovering: false,
  mode: null,
  annotations: {},
  editingAnnotation: null,
}

describe('Shared.Reducers.annotations', () => {
  it('can load the annotations', () => {
    const expected = {
      [a1.id]: a1,
    }

    const actual = reducer(state, loadAnnotations([a1]))

    expect(actual.annotations).toEqual(expected)
  })
  it('can update an annotation', () => {
    const updated = {...a1, startTime: 6666666666666}
    const expected = {
      [a1.id]: updated,
    }

    const actual = reducer(
      {...state, annotations: {[a1.id]: a1}},
      updateAnnotation(updated)
    )

    expect(actual.annotations).toEqual(expected)
  })

  it('can delete an annotation', () => {
    const expected = {
      [a1.id]: null,
      [a2.id]: a2,
    }
    const actual = reducer(
      {
        ...state,
        annotations: {
          [a1.id]: a1,
          [a2.id]: a2,
        },
      },
      deleteAnnotation(a1)
    )

    expect(actual.annotations).toEqual(expected)
  })

  it('can add an annotation', () => {
    const expected = {[a1.id]: a1}
    const actual = reducer(state, addAnnotation(a1))

    expect(actual.annotations).toEqual(expected)
  })
})
