import {
  AttributeType,
  EntityType,
  ModelType,
  RelationType,
} from "@/lib/schemas/tables-schema";
import { AbstractOutputStrategy } from "./output-strategy";

export class PrismaStrategy extends AbstractOutputStrategy {
  generateSchema(model: ModelType): string {
    let entities = model.entities.map((entity) =>
      this.generateEntitySchema(model, entity)
    );
    return `// Generated at remix-gen.khld.dev\n\n${entities.join("\n\n")}`;
  }

  private generateEntitySchema(model: ModelType, entity: EntityType): string {
    let fields = entity.data.attributes
      .filter((attr) => attr.relationKey == null)
      .map((attr) => this.generateColumnDef(attr));

    let relationsString = this.generateRelations(model, entity);
    return `model ${entity.data.name} {\n  ${
      fields.length > 0 ? fields.join("\n  ") : ""
    }${relationsString.length > 0 ? relationsString.join("\n  ") : ""}\n}`;
  }

  private generateColumnDef(attr: AttributeType): string {
    let field = `${this.toSnakeCase(attr.name)} ${this.prismaFieldType(
      attr.type
    )}${attr.nullable ? "?" : ""}`;
    if (attr.primaryKey) field += " @id @autoincrement"; // I generally only use DBs with autoincrement
    if (attr.default) field += ` @default(${attr.default})`;
    return field;
  }

  private generateRelations(model: ModelType, entity: EntityType): string[] {
    return model.relations.map((relation) =>
      this.generateRelationDef(entity, relation)
    );
  }

  private generateRelationDef(
    entity: EntityType,
    relation: RelationType
  ): string {
    let from = relation.fromEntity.data.name.toLocaleLowerCase();
    let to = relation.toEntity.data.name.toLocaleLowerCase();
    let relationDefString = "";

    if (relation.type == "one-to-one") {
      relationDefString = this.generateOneToOneRelationDef(
        entity,
        relation,
        to,
        from
      );
    } else if (relation.type == "one-to-many") {
      relationDefString = this.generateOneToManyRelationDef(
        entity,
        relation,
        to,
        from
      );
    } else if (relation.type == "many-to-many") {
      relationDefString = this.generateManyToManyRelationDefString(
        entity,
        relation,
        from,
        to
      );
    }
    return relationDefString;
  }

  private generateManyToManyRelationDefString(
    entity: EntityType,
    relation: RelationType,
    from: string,
    to: string
  ) {
    let relationDefString = "";
    let throughEntity = relation.throughEntity;
    if (!throughEntity)
      throw new Error("No through entity found for Through Entity");
    let through = throughEntity.data.name.toLocaleLowerCase();
    if (entity.id === relation.fromEntity.id) {
      relationDefString += `${through} ${this.toPascalCase(through)}[]`;
    } else if (entity.id === relation.toEntity.id) {
      relationDefString += `${through} ${this.toPascalCase(through)}[]`;
    } else if (entity.id === throughEntity.id) {
      let fromRelId = this.getPrimaryKeyName(relation.fromEntity);
      if (!fromRelId) throw new Error("No primary key found for " + from);
      let toRelId = this.getPrimaryKeyName(relation.toEntity);
      if (!toRelId) throw new Error("No primary key found for " + to);

      relationDefString += this.generateRelationString(to, from, fromRelId);
      relationDefString += "\n  ";
      relationDefString += this.generateRelationString(from, to, toRelId);
      relationDefString += "\n";
    }
    return relationDefString;
  }

  private generateOneToManyRelationDef(
    entity: EntityType,
    relation: RelationType,
    to: string,
    from: string
  ) {
    let relationDefString = "";
    if (entity.id === relation.fromEntity.id) {
      relationDefString += `${to} ${this.toPascalCase(to)}[]`;
    } else if (entity.id === relation.toEntity.id) {
      let receivingId = this.getPrimaryKeyName(relation.fromEntity);
      if (!receivingId) throw new Error("No primary key found for " + to);

      relationDefString += this.generateRelationString(to, from, receivingId);
    }
    return relationDefString;
  }

  private generateOneToOneRelationDef(
    entity: EntityType,
    relation: RelationType,
    to: string,
    from: string
  ): string {
    let relationDefString = "";
    if (entity.id === relation.fromEntity.id) {
      relationDefString += `${to} ${this.toPascalCase(to)}?`;
    } else if (entity.id === relation.toEntity.id) {
      let receivingId = this.getPrimaryKeyName(relation.fromEntity);
      if (!receivingId) throw new Error("No primary key found for " + to);

      relationDefString += this.generateRelationString(to, from, receivingId);
    }
    return relationDefString;
  }

  private generateRelationString(
    to: string,
    from: string,
    receivingId: string
  ): string {
    return `${this.toSnakeCase(from)} ${this.toPascalCase(
      from
    )} @relation(fields: [${to}Id], references: [${receivingId}])\n  ${to.toLocaleLowerCase()}Id Int @unique`;
  }

  private getPrimaryKeyName(entity: EntityType): string | undefined {
    return entity.data.attributes
      .find((attr) => attr.primaryKey)
      ?.name.toLocaleLowerCase();
  }

  private prismaFieldType(type: string): string {
    const types: { [key: string]: string } = {
      identifier: "Int",
      string: "String",
      number: "Int",
      json: "Json",
      date: "DateTime",
      datetime: "DateTime",
      boolean: "Boolean",
      timestamp: "DateTime",
      money: "Float",
    };
    return types[type] || "String";
  }
}
