import { ModelType } from "@/schemas";

export abstract class IOutputStrategy {
  abstract generateSchema(model: ModelType): string;

  toSnakeCase = (str: string): string => {
    return str
      .replace(/\W+/g, " ")
      .split(/ |\B(?=[A-Z])/)
      .map((word) => word.toLowerCase())
      .join("_");
  };
}
