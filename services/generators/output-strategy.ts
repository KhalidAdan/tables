import { ModelType } from "@/schemas";

export abstract class AbstractOutputStrategy {
  abstract generateSchema(model: ModelType): string;

  toSnakeCase = (str: string): string => {
    return str
      .replace(/\W+/g, " ")
      .split(/ |\B(?=[A-Z])/)
      .map((word) => word.toLowerCase())
      .join("_");
  };

  toPascalCase = (str: string): string => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("");
  };
}
