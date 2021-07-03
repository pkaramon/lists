import { SchemaType } from "../Schema";

export default interface RequestBodyValidator {
  validate(body: any): void;
}

export interface RequestBodyValidatorConstructor {
  new (schema: SchemaType): RequestBodyValidator;
}
