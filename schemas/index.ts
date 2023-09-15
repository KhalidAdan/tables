import { z } from "zod";

// https://zod.dev/?id=recursive-types
/**
 * You can define a recursive schema in Zod, but because of a limitation of TypeScript,
 * their type can't be statically inferred. Instead you'll need to define the type
 * definition manually, and provide it to Zod as a "type hint".
 */
export type IdentifierType = string;
export type AttributeType = z.infer<typeof AttributeSchema>;
export type RelationType = z.infer<typeof RelationSchema>;
export type ModelType = z.infer<typeof ModelSchema>;
export type AnchorType = z.infer<typeof Anchor>;
export type EntityType = {
  id: IdentifierType;
  name: string;
  x?: number;
  y?: number;
  fromAnchor: AnchorType | null;
  toAnchor: AnchorType | null;
  attributes: AttributeType[];
};

export const Identifier = z.string().uuid(); // if I decide to use a DB i'll let it generate the uuids

const AttributeTypes = z.enum([
  "identifier",
  "string",
  "number",
  "json",
  "date",
  "boolean",
  "timestamp",
  "money",
  // "enum",
] as const);

// Enums:
// MySQL 8,0 https://dev.mysql.com/doc/refman/8.0/en/enum.html
// Postgres https://www.postgresql.org/docs/9.1/datatype-enum.html
// Seems like they store case sensitive strings under the hood

// CHECK CONSTRAINTS:
// MySQL8: https://dev.mysql.com/doc/refman/8.0/en/create-table-check-constraints.html // email: (`email` REGEXP "^[a-zA-Z0-9][a-zA-Z0-9.!#$%&'*+-/=?^_`{|}~]*?[a-zA-Z0-9._-]?@[a-zA-Z0-9][a-zA-Z0-9._-]*?[a-zA-Z0-9]?\\.[a-zA-Z]{2,63}$");
// Postgres: https://www.postgresql.org/docs/9.1/ddl-constraints.html // email: CHECK (email ~* '^[a-zA-Z0-9][a-zA-Z0-9.!#$%&'*+-/=?^_`{|}~]*?[a-zA-Z0-9._-]?@[a-zA-Z0-9][a-zA-Z0-9._-]*?[a-zA-Z0-9]?\\.[a-zA-Z]{2,63}$')

export const AttributeSchema = z
  .object({
    id: Identifier,
    name: z.string(),
    type: AttributeTypes,
    primaryKey: z.boolean(),
    nullable: z.boolean(),
    unique: z.boolean(),
    default: z.any().optional(),
    relationKey: Identifier.optional(),
  })
  .refine(
    (data) => {
      if (data.default === undefined) return true;
      if (data.nullable && data.primaryKey) return false;
      if (data.nullable) return true;
      switch (data.type) {
        case "identifier":
          return typeof data.default === "number";
        case "string":
          return typeof data.default === "string";
        case "number":
          return typeof data.default === "number";
        case "json":
          try {
            JSON.parse(String(data.default));
            return true;
          } catch {
            return false;
          }
        case "date":
          return (
            data.default instanceof Date ||
            !Number.isNaN(Date.parse(data.default))
          );
        case "boolean":
          return typeof data.default === "boolean";
        case "timestamp":
          return (
            data.default instanceof Date ||
            !Number.isNaN(Date.parse(data.default))
          );
        case "money":
          return typeof data.default === "number";
        default:
          return false;
      }
    },
    {
      message: "Invalid default value for the given attribute type",
    }
  );

const Anchor = z
  .object({
    x: z.number(),
    y: z.number(),
  })
  .nullable();

export const EntitySchema: z.ZodType<EntityType> = z.object({
  id: Identifier,
  name: z.string(),
  x: z.number().default(0),
  y: z.number().default(0),
  fromAnchor: Anchor,
  toAnchor: Anchor,
  attributes: z.array(AttributeSchema),
});

export const relations = [
  {
    key: "one-to-one",
    value: "One to One",
  },
  {
    key: "one-to-many",
    value: "One to Many",
  },
  {
    key: "many-to-many",
    value: "Many to Many",
  },
] as const;

export type RelationKeyType = (typeof relations)[number]["key"];

export type AddRelationFormProps = {
  id: string;
  fromEntityId: string;
  toEntityId: string;
  type: RelationKeyType;
};

export const RelationSchema = z.object({
  id: Identifier,
  fromEntity: z.lazy(() => EntitySchema),
  toEntity: z.lazy(() => EntitySchema),
  throughEntity: z.lazy(() => EntitySchema).optional(),
  type: z.enum(["one-to-one", "one-to-many", "many-to-many"] as const),
});

const targets = ["postgres", "mysql", "prisma"] as const;

const TargetTypes = z.enum(targets);

export const ModelSchema = z.object({
  name: z.literal("Tables App"),
  entities: z.array(EntitySchema),
  relations: z.array(RelationSchema),
  target: TargetTypes,
  placementMode: z.boolean().default(false),
  ghostPosition: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .nullable(),
});

/**
 * Ah, one-to-one relationships in databases—what a quaint little mythology! It's as if
 * someone looked at a relational database, a masterwork designed to store vast,
 * interconnected realms of data, and thought, "You know what would be fun? Assigning
 * this data a monogamous partner and making them inseparable for all eternity. Like
 * lovebirds, or those tandem bicycles nobody actually enjoys using." Let's be real,
 * one-to-one relationships in databases are the cargo shorts of data design. Sure, they
 * have a lot of pockets (read: columns), but do you actually need them? No. You just
 * end up hauling around a bunch of unnecessary baggage, confusing everyone who tries to
 * read your pants, err, columns. Don't fall for this romanticized relic of database lore. Free your
 * tables, and let them live their best, independent lives!
 */
