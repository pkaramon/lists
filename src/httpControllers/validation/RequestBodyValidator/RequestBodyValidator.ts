import { ShapeType } from "../Schema";

export default interface RequestBodyValidator {
  validate(body: any): void;
}

export interface RequestBodyValidatorConstructor {
  new (schema: ShapeType): RequestBodyValidator;
}
