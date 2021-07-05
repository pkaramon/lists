import Shape from "./Shape";

type FromShape<ShapeType extends Shape> = {
  [key in keyof ShapeType]: ShapeType[key] extends StringConstructor
    ? string
    : ShapeType[key] extends NumberConstructor
    ? number
    : ShapeType[key] extends BooleanConstructor
    ? boolean
    : ShapeType[key] extends DateConstructor
    ? Date
    : ShapeType[key] extends Shape
    ? FromShape<ShapeType[key]>
    : never;
};

export default FromShape;
