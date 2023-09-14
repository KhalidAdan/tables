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
  relations: RelationType[];
};

export const Identifier = z.string().uuid(); // if I decide to use a DB i'll let it generate the uuids

const AttributeTypes = z.enum([
  "serial",
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

export const AttributeSchema = z
  .object({
    id: Identifier,
    name: z.string(),
    type: AttributeTypes,
    primaryKey: z.boolean(),
    nullable: z.boolean(),
    unique: z.boolean(),
    default: z.any().optional(),
  })
  .refine(
    (data) => {
      if (data.default === undefined) return true;
      if (data.nullable && data.primaryKey) return false;
      if (data.nullable) return true;
      switch (data.type) {
        case "serial":
          console.log("serial", data.default, typeof data.default);
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
  relations: z.array(z.lazy(() => RelationSchema)),
});

export const RelationSchema = z.object({
  id: Identifier,
  fromEntity: z.lazy(() => EntitySchema),
  toEntity: z.lazy(() => EntitySchema),
  type: z.enum(["one-to-many", "many-to-one", "many-to-many"] as const),
});

// TODO: support mysql
const targets = ["postgres", "mysql", "prisma"] as const;

const TargetTypes = z.enum(targets);

export const ModelSchema = z.object({
  name: z.literal("Tables App"),
  entities: z.array(EntitySchema),
  relations: z.array(RelationSchema),
  target: TargetTypes,
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
