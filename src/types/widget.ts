export type WidgetId =
  | 'clock'
  | 'greeting'
  | 'search'
  | 'quick-links'
  | 'hafez'
  | 'todo'

export interface WidgetPosition {
  x: number
  y: number
  w: number
  h: number
}

export interface WidgetInstance {
  id: string
  type: WidgetId
  position: WidgetPosition
  settings: Record<string, unknown>
}

export interface WidgetDefinition {
  type: WidgetId
  title: string
  description?: string
  defaultSize: {
    w: number
    h: number
  }
  minSize?: {
    w: number
    h: number
  }
  maxSize?: {
    w: number
    h: number
  }
  defaultSettings: Record<string, unknown>
}
