import {
  AttributeType,
  EntityType,
  ModelType,
  RelationType,
} from "@/schemas/tables-schema";
import { AbstractOutputStrategy } from "./output-strategy";

export class SQLiteStrategy extends AbstractOutputStrategy {
  generateSchema(model: ModelType): string {
    const lines = model.entities.map((entity) =>
      this.generateEntitySchema(model, entity)
    );
    return `-- ${
      model.name
    } schema generated at tables.khld.dev\n\n${lines.join("\n\n")}`;
  }

  private generateEntitySchema(model: ModelType, entity: EntityType): string {
    const uniqueAttributes: any[] = [];
    const columnDefs = entity.data.attributes
      .filter((attr) => !attr.relationKey)
      .map((attr: AttributeType) =>
        this.generateColumnDef(attr, uniqueAttributes)
      );

    const foreignKeys = this.generateForeignKeys(model, entity.id);
    if (foreignKeys) columnDefs.push(foreignKeys);

    const uniqueColumns = this.generateUniqueColumns(uniqueAttributes);
    if (uniqueColumns) columnDefs.push(uniqueColumns);

    return `CREATE TABLE ${this.toSnakeCase(
      entity.data.name
    )} (\n  ${columnDefs.join(",\n  ")}\n);`;
  }

  private generateColumnDef(
    attr: AttributeType,
    uniqueAttributes: string[]
  ): string {
    if (attr.relationKey) return "";

    let def = `${this.toSnakeCase(attr.name)} ${this.columnType(attr.type)}`;

    if (attr.primaryKey) def += " PRIMARY KEY AUTOINCREMENT";
    if (attr.default) def += ` DEFAULT ${attr.default}`;
    if (!attr.nullable && !attr.primaryKey) def += " NOT NULL";

    if (attr.unique) uniqueAttributes.push(attr.name);

    return def;
  }

  private generateForeignKeys(
    model: ModelType,
    entityId: string
  ): string | null {
    const foreignKeys = model.relations
      .map((relation) => this.generateForeignKey(model, entityId, relation))
      .filter(Boolean);

    return foreignKeys.length > 0 ? `${foreignKeys.join(",\n  ")}` : null;
  }

  private findEntityAndPK(id: string, model: ModelType) {
    const entity = model.entities.find((e) => e.id === id);
    if (!entity) throw new Error(`Entity not found: ${id}`);
    const pk = entity.data.attributes.find((attr) => attr.primaryKey);
    if (!pk) throw new Error(`Primary key not found for entity: ${id}`);
    return { entity, pk };
  }

  private generateRefString(
    name: string,
    pkName: string,
    relation: RelationType
  ) {
    return `${this.toSnakeCase(
      name
    )}_id INTEGER,\n  FOREIGN KEY (${this.toSnakeCase(
      name
    )}_id) REFERENCES ${this.toSnakeCase(name)}(${this.toSnakeCase(
      pkName
    )}) ON DELETE ${relation.onDelete} ON UPDATE ${relation.onUpdate}`;
  }

  private generateForeignKey(
    model: ModelType,
    entityId: string,
    relation: RelationType
  ): string | undefined {
    if (
      relation.type !== "one-to-many" &&
      relation.type !== "one-to-one" &&
      relation.type !== "many-to-many"
    )
      throw new Error(`Unsupported relation type: ${relation.type}`);

    // handle one to one and one to many
    if (relation.type === "one-to-one" || relation.type === "one-to-many") {
      if (relation.toEntity.id !== entityId) return;

      const { entity: fromEntity, pk: primaryKeyAttribute } =
        this.findEntityAndPK(relation.fromEntity.id, model);

      return this.generateRefString(
        fromEntity.data.name,
        primaryKeyAttribute.name,
        relation
      );
    }

    // handle many to many
    if (relation.type === "many-to-many") {
      if (!relation.throughEntity)
        throw new Error("Missing through entity on a many-to-many relation");
      if (relation.throughEntity.id !== entityId) return;

      const { entity: fromEntity, pk: fromPrimaryKeyAttribute } =
        this.findEntityAndPK(relation.fromEntity.id, model);
      const { entity: toEntity, pk: toPrimaryKeyAttribute } =
        this.findEntityAndPK(relation.toEntity.id, model);

      return `${this.generateRefString(
        fromEntity.data.name,
        fromPrimaryKeyAttribute.name,
        relation
      )},\n  ${this.generateRefString(
        toEntity.data.name,
        toPrimaryKeyAttribute.name,
        relation
      )}`;
    }
  }

  private generateUniqueColumns(uniqueAttributes: string[]): string | null {
    if (uniqueAttributes.length === 0) return null;
    return `UNIQUE (${uniqueAttributes
      .map((attr) => this.toSnakeCase(attr))
      .join(", ")})`;
  }

  private columnType(type: string): string {
    const types: { [key: string]: string } = {
      identifier: "INTEGER", // columnDef handles primary key and autoincrement
      string: "TEXT",
      number: "INTEGER",
      json: "TEXT", // SQLite doesn't have a native JSON type, this needs to be validated on the application level or at insert time https://www.sqlite.org/json1.html
      date: "TEXT", // Could also be INTEGER to store UNIX timestamps
      datetime: "TEXT",
      boolean: "INTEGER", // SQLite doesn't have a native BOOLEAN type, it is up to the user to store it as INTEGER and ensure it is 1 or 0 (until check constraints)
      timestamp: "TEXT", // Could be stored as UNIX timestamp (INTEGER) as well
      money: "REAL", // DECIMAL type is not supported in SQLite
    };

    const columnType = types[type];
    if (!columnType) throw new Error(`Unsupported field type: ${type}`);
    return columnType;
  }
}
