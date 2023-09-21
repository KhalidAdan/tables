import { MySQLStrategy } from "./mysql-strategy";
import { AbstractOutputStrategy } from "./output-strategy";
import { PostgresStrategy } from "./postgres-strategy";
import { SQLiteStrategy } from "./sqlite-strategy";

export const schemaStrategies: { [key: string]: AbstractOutputStrategy } = {
  postgres: new PostgresStrategy(),
  mysql: new MySQLStrategy(),
  sqlite: new SQLiteStrategy(),
};
