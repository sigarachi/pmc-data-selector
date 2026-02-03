import { object, ObjectSchema, string } from "yup";
import type { ParamFormInputs } from "./hooks/use-param-form";

const REQUIRED_MESSAGE = "Обязательное поле";

export const paramSchema: ObjectSchema<ParamFormInputs> = object({
  name: string().required(REQUIRED_MESSAGE),
  value: string().required(REQUIRED_MESSAGE),
}).required();
