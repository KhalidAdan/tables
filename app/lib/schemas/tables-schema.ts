import { z } from "zod";

export type IdentifierType = string;
export type AttributeType = z.infer<typeof AttributeSchema>;
export type RelationType = z.infer<typeof RelationSchema>;
export type ModelType = z.infer<typeof ModelSchema>;
export type EntityType = z.infer<typeof EntitySchema>;
export let Identifier = z.string().uuid(); // Decide on DB or client gen if adding a DB

export let attributes = [
  "identifier",
  "string",
  "number",
  "json",
  "date",
  "datetime",
  "timestamp",
  "boolean",
  "money",
] as const;

let AttributeTypes = z.enum(attributes);

let isValidDateTimeDefault = (defaultValue: string | Date) => {
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

export let AttributeSchema = z
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
      if (data.nullable && data.unique) return false;
      if (data.nullable) return true;

      let coercedDefaultValue;

      switch (data.type) {
        case "identifier":
          return true; // Because this is generated on the client with a uuid library the app will complain loudly if there is an issue. If a DB enters the chat, we'll need to validate uuid's generated on the client (if we go that route and dont use the DB to do it)
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

export let EntitySchema = z.object({
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

export let relations = [
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

export type RelationKeyType = typeof relations[number]["key"];

export type AddRelationFormProps = z.infer<typeof AddRelationFormSchema>;

let onUpdateOrDeleteActions = [
  "CASCADE",
  "NO ACTION",
  "RESTRICT",
  "SET NULL",
  "SET DEFAULT",
] as const;

export let RelationSchema = z.object({
  id: Identifier,
  fromEntity: EntitySchema,
  toEntity: EntitySchema,
  throughEntity: EntitySchema.optional(),
  type: z.enum(["one-to-one", "one-to-many", "many-to-many"] as const),
  x: z.number().nullish(),
  y: z.number().nullish(),
  onDelete: z.enum(onUpdateOrDeleteActions).default("CASCADE"),
  onUpdate: z.enum(onUpdateOrDeleteActions).default("CASCADE"),
});

let targets = ["postgres", "mysql", "sqlite"] as const;

export let AddRelationFormSchema = RelationSchema.pick({
  id: true,
  type: true,
  onDelete: true,
  onUpdate: true,
}).extend({
  fromEntityId: Identifier,
  toEntityId: Identifier,
  position: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .nullish(),
});

let TargetTypes = z.enum(targets);

export let ModelSchema = z.object({
  name: z.literal("Tables App"),
  entities: z.array(EntitySchema),
  relations: z.array(RelationSchema),
  target: TargetTypes,
  placementMode: z.boolean().default(false),
  ghostPosition: z.object({
    x: z.number(),
    y: z.number(),
  }),
});
