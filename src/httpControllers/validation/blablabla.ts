type SchemaType =
  | StringConstructor
  | NumberConstructor
  | DateConstructor
  | BooleanConstructor
  | ObjectShape2<any>
  | ObjectShape;

type ObjectShape = {
  [key: string]: BaseSchema<any, any>;
};

type ObjectShape2<Type > = {
  [key in keyof Type]: BaseSchema<any, any>;
};

export class BaseSchema<
  S extends SchemaType,
  Info extends { optional?: true }
> {
  constructor(private data: { type: S } & Info) {}

  get type() {
    return this.data.type;
  }

  get info(): Info {
    return this.data;
  }

  optional(): BaseSchema<S, Info & { optional: true }> {
    this.info.optional = true;
    return this as BaseSchema<S, Info & { optional: true }>;
  }
}

export class ObjectSchema<
  S extends ObjectShape2,
  Info extends { optional?: true }
> extends BaseSchema<S, Info> {
  constructor(public shape: S, info?: Info) {
    super({ type: shape, ...((info ?? {}) as Info) });
  }
}

const Types = {
  string: () => new BaseSchema({ type: String }),
  number: () => new BaseSchema({ type: Number }),
  boolean: () => new BaseSchema({ type: Boolean }),
  date: () => new BaseSchema({ type: Date }),
  object: (shape: ObjectShape2) => new ObjectSchema(shape),
};

const schema = Types.object({
  name: Types.string().optional(),
  age: Types.number().optional(),
  address: Types.object({
    streetName: Types.string(),
    zipCode: Types.string(),
  }).optional(),
});

const addressSchema = Types.object({
  streetName: Types.string(),
  zipCode: Types.string(),
}).optional();

type sch = typeof schema;

type Result<Shape extends ObjectShape2> = {
  [key in keyof Shape]: Shape[key]["type"] extends NumberConstructor
    ? number
    : Shape[key]["type"] extends StringConstructor
    ? string
    : never;
};

type y = Result<sch["shape"]>;

export default Types;
