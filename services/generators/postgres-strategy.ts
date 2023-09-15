import { AttributeType, EntityType, ModelType, RelationType } from "@/schemas";
import { AbstractOutputStrategy } from "./output-strategy";

export class PostgresStrategy extends AbstractOutputStrategy {
  generateSchema(model: ModelType): string {
    const lines = model.entities.map((entity) =>
      this.generateEntitySchema(model, entity)
    );
    return `-- generated at tables.khld.dev\n\n${lines.join("\n\n")}`;
  }

  private generateEntitySchema(model: ModelType, entity: EntityType): string {
    const uniqueAttributes: any[] = [];
    const columnDefs = entity.attributes.map((attr: AttributeType) =>
      this.generateColumnDef(attr, uniqueAttributes)
    );

    const foreignKeys = this.generateForeignKeys(model, entity.id);
    if (foreignKeys) columnDefs.push(foreignKeys);

    const uniqueColumns = this.generateUniqueColumns(uniqueAttributes);
    if (uniqueColumns) columnDefs.push(uniqueColumns);

    return `CREATE TABLE ${this.toSnakeCase(
      entity.name
    )} (\n  ${columnDefs.join(",\n  ")}\n)`;
  }

  private generateColumnDef(
    attr: AttributeType,
    uniqueAttributes: string[]
  ): string {
    if (attr.foreignKey) return "";

    let def = `${this.toSnakeCase(attr.name)} ${this.columnType(
      attr.type
    ).toUpperCase()}`;

    if (attr.primaryKey) def += " PRIMARY KEY";
    if (attr.default) def += ` DEFAULT ${attr.default}`;
    if (!attr.nullable || attr.primaryKey) def += " NOT NULL";

    if (attr.unique) uniqueAttributes.push(attr.name);

    return def;
  }

  private generateForeignKeys(
    model: ModelType,
    entityId: string
  ): string | null {
    const foreignKeys = model.relations
      .filter((relation) => relation.toEntity.id === entityId)
      .map((relation) => this.generateForeignKey(model, relation));

    return foreignKeys.length > 0 ? `${foreignKeys.join(",\n  ")}` : null;
  }

  private generateForeignKey(model: ModelType, relation: RelationType): string {
    // TODO: handle missing entities and attributes more gracefully
    const toEntity = model.entities.find(
      (entity) => entity.id === relation.toEntity.id
    )!;
    const primaryKeyAttribute = toEntity.attributes.find(
      (attr) => attr.primaryKey
    )!;

    return `${this.toSnakeCase(
      relation.fromEntity.name
    )}_id int REFERENCES ${this.toSnakeCase(
      relation.fromEntity.name
    )}(${this.toSnakeCase(primaryKeyAttribute.name)}) ON DELETE NOT NULL`;
  }

  private generateUniqueColumns(uniqueAttributes: string[]): string | null {
    if (uniqueAttributes.length === 0) return null;
    return `UNIQUE (${uniqueAttributes
      .map((attr) => this.toSnakeCase(attr))
      .join(", ")})`;
  }

  private columnType(type: string): string {
    const types: { [key: string]: string } = {
      identifier: "SERIAL",
      string: "text",
      number: "integer",
      json: "jsonb",
      date: "date",
      boolean: "boolean",
      timestamp: "timestamp",
      money: "money",
    };

    const columnType = types[type];
    if (!columnType) throw new Error(`Unsupported field type: ${type}`);
    return columnType;
  }
}
