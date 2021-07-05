export default interface Shape {
  [key: string]: ShapeType | Shape;
}

export type ShapeType =
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | DateConstructor;
