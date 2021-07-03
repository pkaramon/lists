import FromSchema from "../FromSchema";
import BodyIsNotAnObjectError from "./BodyIsNotAnObjectError";
import RequestBodyError from "./RequestBodyError";
import Schema from "../Schema";

export default class RequestBodyValidatorImp<SchemaType extends Schema> {
  constructor(private schema: SchemaType) {}

  validate(body: any): FromSchema<SchemaType> {
    this.checkIfBodyIsAnObject(body);
    this.validateKeys(body);
    return this.preprocessBody(body);
  }

  private checkIfBodyIsAnObject(body: any) {
    if (typeof body !== "object" || body === null || body === undefined)
      throw new BodyIsNotAnObjectError();
  }

  private validateKeys(body: any) {
    const missingKeys = this.getMissingKeys(body);
    const keysWithWrongTypes = this.getKeysWithWrongTypes(body, missingKeys);

    if (missingKeys.length > 0 || keysWithWrongTypes.length > 0) {
      throw new RequestBodyError(
        missingKeys,
        this.createPropsWithInvalidTypes(body, keysWithWrongTypes)
      );
    }
  }

  private getMissingKeys(body: any) {
    const missingKeys = this.getKeys().filter((k) => body[k] === undefined);
    return missingKeys;
  }

  private getKeysWithWrongTypes(body: any, missingKeys: string[]) {
    return this.getKeys()
      .filter((k) => !missingKeys.includes(k))
      .filter((k) => {
        const desiredType = this.schema[k];
        if (desiredType === Date) {
          return body[k].constructor !== String;
        } else {
          return desiredType !== body[k].constructor;
        }
      });
  }

  private getKeys() {
    return Object.getOwnPropertyNames(this.schema);
  }

  private createPropsWithInvalidTypes(body: any, keysWithWrongTypes: string[]) {
    return keysWithWrongTypes.map((k) => {
      const desiredType = this.schema[k];
      return {
        key: k,
        wanted: desiredType,
        got: body[k].constructor,
      };
    });
  }

  private preprocessBody(body: any) {
    return this.convertStringDatesToDateObjects(body);
  }

  private convertStringDatesToDateObjects(body: any) {
    const dateKeys = this.getKeys().filter((k) => this.schema[k] === Date);
    for (const key of dateKeys) {
      if (typeof body[key] === "string") {
        body[key] = new Date(body[key]);
      }
    }
    return body;
  }
}
