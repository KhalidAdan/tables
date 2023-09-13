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
export type EntityType = {
  id: IdentifierType;
  name: string;
  attributes: AttributeType[];
  createdAt: Date;
  updatedAt: Date;
};

export const Identifier = z.coerce.string();

export const AttributeSchema = z.object({
  id: Identifier,
  name: z.string(),
  type: z.string(), // string, number, json
  value: z.any(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const EntitySchema: z.ZodType<EntityType> = z.object({
  id: Identifier,
  name: z.string(),
  attributes: z.array(AttributeSchema),
  relations: z.array(z.lazy(() => RelationSchema)),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const RelationSchema = z.object({
  id: Identifier,
  fromEntity: z.lazy(() => EntitySchema),
  toEntity: z.lazy(() => EntitySchema),
  type: z.enum(["one-to-many", "many-to-one", "many-to-many"] as const),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ModelSchema = z.object({
  name: z.literal("Tables App"),
  entities: z.array(EntitySchema),
  relations: z.array(RelationSchema),
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
 * read your pants. Don't fall for this romanticized relic of database lore. Free your
 * tables, and let them live their best, independent lives!
 */
