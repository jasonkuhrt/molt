export interface RenderContext {
  maxWidth?: undefined | number
  height?: undefined | number
  color?: undefined | ((text: string) => string)
  phase?: undefined | 'inner' | 'outer'
  index: {
    total: number
    isLast: boolean
    isFirst: boolean
    position: number
  }
}

export interface Shape {
  intrinsicWidth: number
  intrinsicHeight: number
  desiredWidth: number | null
}
