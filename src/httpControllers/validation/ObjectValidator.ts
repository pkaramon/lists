import FromShape from "./FromShape";
import Shape from "./Shape";

export default interface ObjectValidator<ShapeType extends Shape> {
  validate(obj: any): Promise<FromShape<ShapeType>>;
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
