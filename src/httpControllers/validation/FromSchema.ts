type FromSchema<Schema> = {
  [key in keyof Schema]: Schema[key] extends StringConstructor
    ? string
    : Schema[key] extends NumberConstructor
    ? number
    : Schema[key] extends DateConstructor
    ? Date
    : never;
};


export default FromSchema
