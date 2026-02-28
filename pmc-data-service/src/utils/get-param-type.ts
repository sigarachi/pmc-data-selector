import { ParamType } from "@prisma/client";
import { CsvParamName } from "../models/param";

export const getParamType = (param: CsvParamName): ParamType => {
    if(param.includes('date')) {
        return 'date';
    }
    if(param.includes('coords')) {
        return 'coords'
    }

    return 'string'
}