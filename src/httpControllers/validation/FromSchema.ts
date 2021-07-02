type FromSchema<Schema> = {
  [key in keyof Schema]: Schema[key] extends StringConstructor
    ? string
    : Schema[key] extends NumberConstructor
    ? number
    : Schema[key] extends BooleanConstructor
    ? boolean
    : Schema[key] extends DateConstructor
    ? Date
    : Schema[key] extends null
    ? null
    : never;
};

export default FromSchema;
