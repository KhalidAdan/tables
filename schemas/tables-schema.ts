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
export type EntityType = z.infer<typeof EntitySchema>;
export const Identifier = z.string().uuid(); // if I decide to use a DB i'll let it generate the uuids

export const attributes = [
  "identifier",
  "string",
  "number",
  "json",
  "date",
  "datetime",
  "timestamp",
  "boolean",
  "money",
  // "enum",
] as const;

const AttributeTypes = z.enum(attributes);

// Enums:
// MySQL 8,0 https://dev.mysql.com/doc/refman/8.0/en/enum.html
// Postgres https://www.postgresql.org/docs/9.1/datatype-enum.html
// Seems like they store case sensitive strings under the hood

// CHECK CONSTRAINTS:
// MySQL8: https://dev.mysql.com/doc/refman/8.0/en/create-table-check-constraints.html // email: (`email` REGEXP "^[a-zA-Z0-9][a-zA-Z0-9.!#$%&'*+-/=?^_`{|}~]*?[a-zA-Z0-9._-]?@[a-zA-Z0-9][a-zA-Z0-9._-]*?[a-zA-Z0-9]?\\.[a-zA-Z]{2,63}$");
// Postgres: https://www.postgresql.org/docs/9.1/ddl-constraints.html // email: CHECK (email ~* '^[a-zA-Z0-9][a-zA-Z0-9.!#$%&'*+-/=?^_`{|}~]*?[a-zA-Z0-9._-]?@[a-zA-Z0-9][a-zA-Z0-9._-]*?[a-zA-Z0-9]?\\.[a-zA-Z]{2,63}$')
const isValidDateTimeDefault = (defaultValue: string | Date) => {
  return (
    defaultValue instanceof Date ||
    !Number.isNaN(Date.parse(defaultValue)) ||
    defaultValue === "NOW()" ||
    defaultValue === "CURRENT_DATE" ||
    defaultValue === "CURRENT_TIME" ||
    defaultValue === "CURRENT_TIMESTAMP" ||
    defaultValue === "CURRENT_DATE()" || // MySQL specific
    defaultValue === "CURRENT_TIME()" || // MySQL specific
    defaultValue === "CURRENT_TIMESTAMP()" || // MySQL specific
    defaultValue === "SYSDATE()" // MySQL specific
  );
};

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

      let coercedDefaultValue;

      switch (data.type) {
        case "identifier":
        case "number":
          coercedDefaultValue = Number(data.default);
          break;
        case "money":
          coercedDefaultValue = Number(data.default.replace(/^\$/, ""));
          break;
        case "boolean":
          coercedDefaultValue =
            data.default === "true"
              ? true
              : data.default === "false"
              ? false
              : null;
          break;
        case "string":
          coercedDefaultValue = String(data.default);
          break;
        case "json":
          try {
            coercedDefaultValue = JSON.parse(String(data.default));
          } catch {
            return false;
          }
          break;
        case "date":
        case "datetime":
        case "timestamp":
          return isValidDateTimeDefault(data.default);
        default:
          return false;
      }

      return coercedDefaultValue !== null && coercedDefaultValue !== undefined;
    },
    {
      message: "Invalid default value for the given attribute type",
    }
  );

export const EntitySchema = z.object({
  id: Identifier,
  type: z.literal("entity"),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: z.object({
    name: z.string(),
    attributes: z.array(AttributeSchema),
  }),
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

export type AddRelationFormProps = z.infer<typeof AddRelationFormSchema>;

const onUpdateOrDeleteActions = [
  "CASCADE",
  "NO ACTION",
  "RESTRICT",
  "SET NULL",
  "SET DEFAULT",
] as const;

export const RelationSchema = z.object({
  id: Identifier,
  fromEntity: z.lazy(() => EntitySchema),
  toEntity: z.lazy(() => EntitySchema),
  throughEntity: z.lazy(() => EntitySchema).optional(),
  type: z.enum(["one-to-one", "one-to-many", "many-to-many"] as const),
  x: z.number().nullish(),
  y: z.number().nullish(),
  onDelete: z.enum(onUpdateOrDeleteActions).default("CASCADE"),
  onUpdate: z.enum(onUpdateOrDeleteActions).default("CASCADE"),
});

const targets = ["postgres", "mysql", "prisma"] as const;

export const AddRelationFormSchema = RelationSchema.pick({
  id: true,
  type: true,
  onDelete: true,
  onUpdate: true,
}).extend({
  fromEntityId: Identifier,
  toEntityId: Identifier,
});

const TargetTypes = z.enum(targets);

export const ModelSchema = z.object({
  name: z.literal("Tables App"),
  entities: z.array(EntitySchema),
  relations: z.array(RelationSchema),
  target: TargetTypes,
  isPlacementMode: z.boolean().default(false),
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
