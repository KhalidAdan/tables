import { ModelType } from "@/schemas";
import { IOutputStrategy } from "./output-strategy";

export class MySQLStrategy implements IOutputStrategy {
  generate(model: ModelType) {
    console.log("Generating MySQL code...");
    return "MySQL schema here...";
  }
}
