import * as yup from "yup";
import ObjectValidator, {
  InvalidDataError,
  InvalidDataFormatError,
} from "../ObjectValidator";
import { ObjectShape, ValueDescriptorType } from "../validationPrimitives";
import { FromTypes } from "../types";

export default class ObjectValidatorYup<S extends ObjectShape>
  implements ObjectValidator<S>
{
  private yupSchema: yup.ObjectSchema<any>;

  constructor(shape: S) {
    this.yupSchema = this.createYupSchema(shape);
  }

  async validate(data: any) {
    if (!this.isDataInCorrectFormat(data)) throw new InvalidDataFormatError();
    try {
      return await this.getResult(data);
    } catch (e) {
      this.handleYupValidationError(e);
    }
  }

  private isDataInCorrectFormat(data: any) {
    return typeof data === "object" && data.constructor === Object;
  }

  private async getResult(data: any) {
    const result = await this.yupSchema.validate(data, { abortEarly: false });
    return result as any as FromTypes<S>;
  }

  private handleYupValidationError(e: any): never {
    const error = e as yup.ValidationError;
    throw new InvalidDataError(error.inner.map((e) => e.path!));
  }

  private createYupSchema(shape: ObjectShape) {
    const yupShape: any = {};
    for (const key in shape) {
      const valueDescriptor = shape[key];
      const schema = this.dispatchTypeToYupSchema(valueDescriptor.type);
      yupShape[key] = this.applyOptions(valueDescriptor.options, schema);
    }
    return yup.object().shape(yupShape);
  }

  private dispatchTypeToYupSchema(type: ValueDescriptorType) {
    switch (type) {
      case String:
        return yup.string().strict();
      case Number:
        return yup.number().strict();
      case Boolean:
        return yup.boolean().strict();
      case Date:
        return yup.date();
      default:
        return this.createYupSchema(type as ObjectShape);
    }
  }

  private applyOptions(options: any, schema: yup.BaseSchema<any>) {
    if (options.optional) {
      return schema.nullable().default(null);
    } else {
      return schema.required();
    }
  }
}
