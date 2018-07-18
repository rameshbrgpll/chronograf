import {Dispatch} from 'redux'
import * as AnnotationData from 'src/types/annotations'

export type Action =
  | EditingAnnotationAction
  | DismissEditingAnnotationAction
  | AddingAnnotationAction
  | AddingAnnotationSuccessAction
  | DismissAddingAnnotationAction
  | MouseEnterTempAnnotationAction
  | MouseLeaveTempAnnotationAction
  | LoadAnnotationsAction
  | UpdateAnnotationAction
  | DeleteAnnotationAction
  | AddAnnotationAction
  | SetEditingAnnotationAction

export interface EditingAnnotationAction {
  type: 'EDITING_ANNOTATION'
}

export type DismissEditingAnnotationActionCreator = () => DismissEditingAnnotationAction

export interface DismissEditingAnnotationAction {
  type: 'DISMISS_EDITING_ANNOTATION'
}

export interface AddingAnnotationAction {
  type: 'ADDING_ANNOTATION'
}

export interface AddingAnnotationSuccessAction {
  type: 'ADDING_ANNOTATION_SUCCESS'
}

export interface DismissAddingAnnotationAction {
  type: 'DISMISS_ADDING_ANNOTATION'
}

export interface MouseEnterTempAnnotationAction {
  type: 'MOUSEENTER_TEMP_ANNOTATION'
}

export interface MouseLeaveTempAnnotationAction {
  type: 'MOUSELEAVE_TEMP_ANNOTATION'
}

export interface LoadAnnotationsAction {
  type: 'LOAD_ANNOTATIONS'
  payload: {
    annotations: AnnotationData.Annotation[]
  }
}

export interface UpdateAnnotationAction {
  type: 'UPDATE_ANNOTATION'
  payload: {
    annotation: AnnotationData.Annotation
  }
}

export interface DeleteAnnotationAction {
  type: 'DELETE_ANNOTATION'
  payload: {
    annotation: AnnotationData.Annotation
  }
}

export interface AddAnnotationAction {
  type: 'ADD_ANNOTATION'
  payload: {
    annotation: AnnotationData.Annotation
  }
}

export interface SetEditingAnnotationAction {
  type: 'SET_EDITING_ANNOTATION'
  payload: string | null
}

export type GetAnnotationsDispatcher = (
  indexUrl: string,
  annotationRange: AnnotationData.AnnotationRange
) => GetAnnotationsThunk

export type GetAnnotationsThunk = (
  dispatch: Dispatch<LoadAnnotationsAction>
) => Promise<void>
