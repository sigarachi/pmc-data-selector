import { array, object, ObjectSchema, string } from "yup";
import type { ParamFormInputs } from "./hooks/use-param-form";

const REQUIRED_MESSAGE = "Обязательное поле";

export const paramSchema: ObjectSchema<ParamFormInputs> = object({
  name: string().required(REQUIRED_MESSAGE),
  value: string().required(REQUIRED_MESSAGE),
  type: array()
    .of(
      object({
        id: string().required(REQUIRED_MESSAGE),
        title: string().required(REQUIRED_MESSAGE),
        value: string().required(),
      }).required(),
    )
    .required(),
}).required();
