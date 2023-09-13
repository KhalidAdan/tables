import { ModelType } from "@/schemas";
import { IOutputStrategy } from "./output-strategy";

export class PostgresStrategy implements IOutputStrategy {
  generate(model: ModelType) {
    console.log("Generating Postgres code...");
    return "Postres schema here...";
  }
}
