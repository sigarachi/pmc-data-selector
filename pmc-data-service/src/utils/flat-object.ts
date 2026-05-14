import util from "util";

function capitalizeFirstLetter(val: string) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

export const flatObject = (obj: object, prefix?: string): object => {
  let result: Record<string, string | number | boolean> = {};

  Object.keys(obj).map((key) => {
    const objkey = key as keyof typeof obj;

    const value = obj[objkey];

    if (
      typeof value === "object" &&
      !Array.isArray(value) &&
      !util.types.isDate(value)
    ) {
      const temp = flatObject(value, objkey);
      for (const j in temp) {
        result[j] = temp[j as keyof typeof temp];
      }
    } else {
      const newName = prefix ? `${prefix}${capitalizeFirstLetter(key)}` : key;
      result[newName] = value;
    }
  });

  return result;
};
