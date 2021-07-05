import { ShapeType } from "../Shape";

export default class RequestBodyError extends Error {
  constructor(
    public missingProps: string[],
    public propsWithInvalidTypes: {
      key: string;
      wanted: ShapeType;
      got: ShapeType;
    }[]
  ) {
    super("shape validation failed");
    this.name = RequestBodyError.name;
  }

  get invalidProps() {
    return [
      ...this.missingProps,
      ...this.propsWithInvalidTypes.map((x) => x.key),
    ];
  }
}
