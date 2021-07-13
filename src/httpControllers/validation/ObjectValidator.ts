import { ObjectShape, Result } from "./validationPrimitives";

export default interface ObjectValidator<ShapeType extends ObjectShape> {
  validate(obj: any): Promise<Result<ShapeType>>;
}

export class InvalidDataFormatError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = InvalidDataFormatError.name;
  }
}

export class InvalidDataError extends Error {
  constructor(public readonly invalidKeys: string[]) {
    super();
  }
}
