import {
  AttributeType,
  EntityType,
  ModelType,
  RelationType,
} from "@/schemas/tables-schema";
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

    let def = `${this.toSnakeCase(attr.name)} ${this.columnType(
      attr.type
    ).toUpperCase()}`;

    if (attr.primaryKey) def += " PRIMARY KEY";
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

  generateRefString = (name: string, pkName: string, relation: RelationType) =>
    `${this.toSnakeCase(name)}_id int REFERENCES ${this.toSnakeCase(
      name
    )}(${this.toSnakeCase(pkName)}) ON DELETE ${relation.onDelete} ON UPDATE ${
      relation.onUpdate
    }`;

  findEntityAndPK = (model: ModelType, id: string) => {
    const entity = model.entities.find((e) => e.id === id);
    if (!entity) throw new Error(`Entity not found: ${id}`);
    const pk = entity.data.attributes.find((attr) => attr.primaryKey);
    if (!pk) throw new Error(`Primary key not found for entity: ${id}`);
    return { entity, pk };
  };

  private generateForeignKey(
    model: ModelType,
    entityId: string,
    relation: RelationType
  ): string | undefined {
    if (relation.type === "one-to-one" || relation.type === "one-to-many") {
      if (relation.toEntity.id !== entityId) return;
      const { entity: fromEntity, pk: primaryKeyAttribute } =
        this.findEntityAndPK(model, relation.fromEntity.id);
      return this.generateRefString(
        fromEntity.data.name,
        primaryKeyAttribute.name,
        relation
      );
    } else if (relation.type === "many-to-many") {
      if (!relation.throughEntity)
        throw new Error("Missing through entity on a many-to-many relation");
      if (relation.throughEntity.id !== entityId) return;

      const { entity: fromEntity, pk: fromPrimaryKeyAttribute } =
        this.findEntityAndPK(model, relation.fromEntity.id);
      const { entity: toEntity, pk: toPrimaryKeyAttribute } =
        this.findEntityAndPK(model, relation.toEntity.id);

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

    throw new Error(`Unsupported relation type: ${relation.type}`);
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
      string: "TEXT",
      number: "INT",
      json: "JSONB",
      date: "DATE",
      datetime: "TIMESTAMP",
      boolean: "BOOLEAN",
      timestamp: "TIMESTAMPTZ",
      money: "MONEY",
    };

    const columnType = types[type];
    if (!columnType) throw new Error(`Unsupported field type: ${type}`);
    return columnType;
  }
}
