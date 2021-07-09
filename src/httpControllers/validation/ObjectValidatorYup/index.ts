import ObjectValidator, {
  InvalidDataError,
  InvalidDataFormatError,
} from "../ObjectValidator";
import Shape, { ShapeType } from "../Shape";
import * as yup from "yup";
import FromShape from "../FromShape";

export default class ObjectValidatorYup<S extends Shape>
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
    return result as FromShape<S>;
  }

  private handleYupValidationError(e: any): never {
    const error = e as yup.ValidationError;
    throw new InvalidDataError(error.inner.map((e) => e.path!));
  }

  private createYupSchema(shape: Shape) {
    const yupShape: any = {};
    for (const key in shape) {
      const type = shape[key];
      yupShape[key] = this.dispatchTypeToYupSchema(type);
    }
    return yup.object().shape(yupShape);
  }

  private dispatchTypeToYupSchema(type: Shape | ShapeType) {
    switch (type) {
      case String:
        return yup.string().strict().required();
      case Number:
        return yup.number().strict().required();
      case Boolean:
        return yup.boolean().strict().required();
      case Date:
        return yup.date().required();
      default:
        return this.createYupSchema(type as Shape);
    }
  }
}
