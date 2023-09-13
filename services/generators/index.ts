import { MySQLStrategy } from "./mysql-strategy";
import { IOutputStrategy } from "./output-strategy";
import { PostgresStrategy } from "./postgres-strategy";

export const schemaStrategies: { [key: string]: IOutputStrategy } = {
  postgres: new PostgresStrategy(),
  mysql: new MySQLStrategy(),
};
