import { MySQLStrategy } from "./mysql-strategy";
import { AbstractOutputStrategy } from "./output-strategy";
import { PostgresStrategy } from "./postgres-strategy";
import { PrismaStrategy } from "./prisma-strategy";
import { SQLiteStrategy } from "./sqlite-strategy";

export let schemaStrategies: { [key: string]: AbstractOutputStrategy } = {
  postgres: new PostgresStrategy(),
  mysql: new MySQLStrategy(),
  sqlite: new SQLiteStrategy(),
  prisma: new PrismaStrategy(),
};
