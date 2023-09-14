import { MySQLStrategy } from "./mysql-strategy";
import { PostgresStrategy } from "./postgres-strategy";

export const schemaStrategies: { [key: string]: AbstractOutputStrategy } = {
  postgres: new PostgresStrategy(),
  mysql: new MySQLStrategy(),
};
