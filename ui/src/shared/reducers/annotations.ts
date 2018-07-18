import {ADDING, EDITING, TEMP_ANNOTATION} from 'src/shared/annotations/helpers'

import {Action} from 'src/types/actions/annotations'
import {Annotation} from 'src/types'

export interface AnnotationState {
  mode: string
  isTempHovering: boolean
  annotations: {
    [annotationId: string]: Annotation
  }
  editingAnnotation: string | null
}

const initialState = {
  mode: null,
  isTempHovering: false,
  annotations: {},
  editingAnnotation: null,
}

const annotationsReducer = (
  state: AnnotationState = initialState,
  action: Action
) => {
  switch (action.type) {
    case 'EDITING_ANNOTATION': {
      return {
        ...state,
        mode: EDITING,
      }
    }

    case 'DISMISS_EDITING_ANNOTATION': {
      return {
        ...state,
        mode: null,
      }
    }

    case 'ADDING_ANNOTATION': {
      return {
        ...state,
        mode: ADDING,
        isTempHovering: true,
        annotations: {
          ...state.annotations,
          [TEMP_ANNOTATION.id]: TEMP_ANNOTATION,
        },
      }
    }

    case 'ADDING_ANNOTATION_SUCCESS': {
      return {
        ...state,
        isTempHovering: false,
        mode: null,
      }
    }

    case 'DISMISS_ADDING_ANNOTATION': {
      return {
        ...state,
        isTempHovering: false,
        mode: null,
        annotations: {
          ...state.annotations,
          [TEMP_ANNOTATION.id]: null,
        },
      }
    }

    case 'MOUSEENTER_TEMP_ANNOTATION': {
      const newState = {
        ...state,
        isTempHovering: true,
      }

      return newState
    }

    case 'MOUSELEAVE_TEMP_ANNOTATION': {
      const newState = {
        ...state,
        isTempHovering: false,
      }

      return newState
    }

    case 'LOAD_ANNOTATIONS': {
      const annotations = {...state.annotations}

      for (const annotation of action.payload.annotations) {
        annotations[annotation.id] = annotation
      }

      return {
        ...state,
        annotations,
      }
    }

    case 'UPDATE_ANNOTATION': {
      const {annotation} = action.payload

      return {
        ...state,
        annotations: {
          ...state.annotations,
          [annotation.id]: annotation,
        },
      }
    }

    case 'DELETE_ANNOTATION': {
      const {annotation} = action.payload

      return {
        ...state,
        annotations: {
          ...state.annotations,
          [annotation.id]: null,
        },
      }
    }

    case 'ADD_ANNOTATION': {
      const {annotation} = action.payload

      return {
        ...state,
        annotations: {
          ...state.annotations,
          [annotation.id]: annotation,
        },
      }
    }

    case 'SET_EDITING_ANNOTATION': {
      return {
        ...state,
        editingAnnotation: action.payload,
      }
    }
  }

  return state
}

export default annotationsReducer
