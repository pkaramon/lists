export default interface Schema {
  [key: string]: SchemaType;
}

export type SchemaType =
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | DateConstructor;
