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
    let fields = entity.data.attributes.map((attr) =>
      this.generateColumnDef(attr)
    );
    let relationsString = this.generateRelations(model, entity);
    return `model ${entity.data.name} {\n  ${fields.join("\n  ")}\n${
      relationsString.length ? "\n  " + relationsString.join("\n  ") : ""
    }}`;
  }

  private generateColumnDef(attr: AttributeType): string {
    let field = `${this.toSnakeCase(attr.name)} ${this.prismaFieldType(
      attr.type
    )}${attr.nullable ? "?" : ""}`;
    if (attr.primaryKey) field += " @id @autoincrement"; // I generally only use DBs with autoincrement
    if (attr.default) field += ` @default(${attr.default})`;
    return field;
  }

  private generateRelations(model: ModelType, entity: EntityType) {
    return model.relations.map((relation) =>
      this.generateRelationDef(model, entity, relation)
    );
  }

  private generateRelationDef(
    model: ModelType,
    entity: EntityType,
    relation: RelationType
  ): string {
    let from = relation.fromEntity.data.name.toLocaleLowerCase();
    let to = relation.toEntity.data.name.toLocaleLowerCase();
    //return relationDefString;
    let relationDefString = "";
    if (relation.type == "one-to-one") {
      // prisma relations can be considerd to have directionality so wse process the fromEntity and the toEntity separately
      if (entity.id === relation.fromEntity.id) {
        relationDefString += `${to} ${this.toPascalCase(to)}?\n`;
      } else if (entity.id === relation.toEntity.id) {
        let receivingId = relation.fromEntity.data.attributes
          .find((attr) => attr.primaryKey)
          ?.name.toLocaleLowerCase();

        if (!receivingId) throw new Error("No primary key found for " + to);

        relationDefString += this.generateRelationString(
          to.toLocaleLowerCase(),
          from.toLocaleLowerCase(),
          receivingId
        );
      }
    } else if (relation.type == "one-to-many") {
      if (entity.id === relation.fromEntity.id) {
        relationDefString += `${to} ${this.toPascalCase(to)}[]\n`;
      } else if (entity.id === relation.toEntity.id) {
        let receivingId = relation.fromEntity.data.attributes
          .find((attr) => attr.primaryKey)
          ?.name.toLocaleLowerCase();

        if (!receivingId) throw new Error("No primary key found for " + to);

        relationDefString += this.generateRelationString(
          to.toLocaleLowerCase(),
          from.toLocaleLowerCase(),
          receivingId
        );
      }
    } else if (relation.type == "many-to-many") {
      // enitity.id == relation.fromEntity.id => add array for relation to throughEntity
      // enitity.id == relation.toEntity.id => add array for relation to throughEntity
      // enitity.id == relation.throughEntity.id => add id field, add
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
    )} @relation(fields: [${to}Id], references: [${receivingId}])\n  ${to}Id Int @unique\n`;
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
