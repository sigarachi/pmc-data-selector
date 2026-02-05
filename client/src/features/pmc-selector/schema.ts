import { object, ObjectSchema, string } from "yup";
import type { PmcFormInputs } from "./hooks/use-pmc-form";

const REQUIRED_MESSAGE = "Обязательное поле";

export const pmcSchema: ObjectSchema<PmcFormInputs> = object({
  name: string().required(REQUIRED_MESSAGE),
}).required();
