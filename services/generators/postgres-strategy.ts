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
    const columnDefs = entity.attributes
      .filter((attr) => !attr.relationKey)
      .map((attr: AttributeType) =>
        this.generateColumnDef(attr, uniqueAttributes)
      );

    const foreignKeys = this.generateForeignKeys(model, entity.id);
    if (foreignKeys) columnDefs.push(foreignKeys);

    const uniqueColumns = this.generateUniqueColumns(uniqueAttributes);
    if (uniqueColumns) columnDefs.push(uniqueColumns);

    console.log(columnDefs);

    return `CREATE TABLE ${this.toSnakeCase(
      entity.name
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

  private generateForeignKey(
    model: ModelType,
    entityId: string,
    relation: RelationType
  ): string | undefined {
    const findEntityAndPK = (id: string) => {
      const entity = model.entities.find((e) => e.id === id);
      if (!entity) throw new Error(`Entity not found: ${id}`);
      const pk = entity.attributes.find((attr) => attr.primaryKey);
      if (!pk) throw new Error(`Primary key not found for entity: ${id}`);
      return { entity, pk };
    };

    const generateRefString = (name: string, pkName: string) =>
      `${this.toSnakeCase(name)}_id int REFERENCES ${this.toSnakeCase(
        name
      )}(${this.toSnakeCase(pkName)}) ON DELETE NO ACTION`;

    if (relation.type === "one-to-one" || relation.type === "one-to-many") {
      if (relation.toEntity.id !== entityId) return;
      const { entity: fromEntity, pk: primaryKeyAttribute } = findEntityAndPK(
        relation.fromEntity.id
      );
      return generateRefString(fromEntity.name, primaryKeyAttribute.name);
    } else if (relation.type === "many-to-many") {
      if (!relation.throughEntity)
        throw new Error("Missing through entity on a many-to-many relation");
      if (relation.throughEntity.id !== entityId) return;

      const { entity: fromEntity, pk: fromPrimaryKeyAttribute } =
        findEntityAndPK(relation.fromEntity.id);
      const { entity: toEntity, pk: toPrimaryKeyAttribute } = findEntityAndPK(
        relation.toEntity.id
      );

      return `${generateRefString(
        fromEntity.name,
        fromPrimaryKeyAttribute.name
      )},\n  ${generateRefString(toEntity.name, toPrimaryKeyAttribute.name)}`;
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
