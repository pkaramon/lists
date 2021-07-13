import {
  ObjectShape,
  Result,
  TypeDescriptorHelper,
} from "./validationPrimitives";

const T = {
  string: () => new TypeDescriptorHelper({ type: String, options: {} }),
  number: () => new TypeDescriptorHelper({ type: Number, options: {} }),
  boolean: () => new TypeDescriptorHelper({ type: Boolean, options: {} }),
  date: () => new TypeDescriptorHelper({ type: Date, options: {} }),
  object: <Shape extends ObjectShape>(s: Shape) =>
    new TypeDescriptorHelper({ type: s, options: {} }),
};

export default T;

export type FromTypes<Shape extends ObjectShape> = Result<Shape>;
