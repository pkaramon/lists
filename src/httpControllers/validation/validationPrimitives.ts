export interface ValueDescriptor {
  type: ValueDescriptorType;
  options: { [key: string]: boolean };
}

export interface ObjectShape {
  [key: string]: ValueDescriptor;
}

export type ValueDescriptorType =
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | DateConstructor
  | ObjectShape;

type FromWrapperToRegular<T> = T extends String
  ? string
  : T extends Number
  ? number
  : T extends Boolean
  ? boolean
  : T;

type Constructor<T> = new (...args: any) => T;

export type Result<Shape extends ObjectShape> = {
  [key in keyof Shape]: Shape[key]["options"]["optional"] extends true
    ? GetTypeFromTypeDescriptor<Shape[key]> | undefined
    : GetTypeFromTypeDescriptor<Shape[key]>;
};

type GetTypeFromTypeDescriptor<Vd extends ValueDescriptor> =
  Vd["type"] extends Constructor<infer InstanceType>
    ? FromWrapperToRegular<InstanceType>
    : Vd["type"] extends ObjectShape
    ? Result<Vd["type"]>
    : never;

type ValueDescriptorWithOptionalOption<Vd extends ValueDescriptor> = {
  type: Vd["type"];
  options: Vd["options"] & {
    optional: true;
  };
};

export class TypeDescriptorHelper<Vd extends ValueDescriptor>
  implements ValueDescriptor
{
  public type: Vd["type"];
  public options: Vd["options"];

  constructor(data: Vd) {
    this.type = data.type;
    this.options = data.options;
  }

  optional(): TypeDescriptorHelper<ValueDescriptorWithOptionalOption<Vd>> {
    (this.options as any).optional = true as true;
    return this as unknown as TypeDescriptorHelper<
      ValueDescriptorWithOptionalOption<Vd>
    >;
  }
}
