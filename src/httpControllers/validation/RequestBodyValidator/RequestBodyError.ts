import { SchemaType } from "../Schema";

export default class RequestBodyError extends Error {
  constructor(
    public missingProps: string[],
    public propsWithInvalidTypes: {
      key: string;
      wanted: SchemaType;
      got: SchemaType;
    }[]
  ) {
    super("schema validation failed");
    this.name = RequestBodyError.name;
  }

  get invalidProps() {
    return [
      ...this.missingProps,
      ...this.propsWithInvalidTypes.map((x) => x.key),
    ];
  }
}
