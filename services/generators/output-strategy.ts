import { ModelType } from "@/schemas";

export interface IOutputStrategy {
  generate(model: ModelType): string;
}
