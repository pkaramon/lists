import ObjectValidator, {
  InvalidDataError,
  InvalidDataFormatError,
} from "../ObjectValidator";
import Shape from "../Shape";
import * as yup from "yup";
import FromShape from "../FromShape";

export default class ObjectValidatorYup<ShapeType extends Shape>
  implements ObjectValidator<ShapeType>
{
  constructor(private shape: ShapeType) {}

  async validate(data: any) {
    if (!this.isDataInCorrectFormat(data)) {
      throw new InvalidDataFormatError();
    }

    const yupSchema = this.createYupSchema(this.shape);
    try {
      const result = await yupSchema.validate(data, { abortEarly: false });
      return result as FromShape<ShapeType>;
    } catch (e) {
      const error = e as yup.ValidationError;
      throw new InvalidDataError(error.inner.map((e) => e.path!));
    }
  }

  private isDataInCorrectFormat(data: any) {
    return typeof data === "object" && data.constructor === Object;
  }

  private createYupSchema(shape: Shape) {
    const yupShape: any = {};
    for (const key in shape) {
      const type = shape[key];
      switch (type) {
        case String:
          yupShape[key] = yup.string().strict().required();
          break;
        case Number:
          yupShape[key] = yup.number().strict().required();
          break;
        case Boolean:
          yupShape[key] = yup.boolean().strict().required();
          break;
        case Date:
          yupShape[key] = yup.date().required();
          break;
        default:
          yupShape[key] = this.createYupSchema(shape[key] as Shape);
          break;
      }
    }
    return yup.object().shape(yupShape);
  }
}
