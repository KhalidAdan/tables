import { z } from "zod";
import { Identifier } from "../schemas/tables-schema";

export type ClientEntityType = z.infer<typeof ClientEntitySchema>;
export type ClientRelationType = z.infer<typeof ClientRelationSchema>;
export type UIType = z.infer<typeof UI>;

let ClientEntitySchema = z.object({
  id: Identifier,
  type: z.literal("entity"),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: z.object({}),
});

export let ClientRelationSchema = z.object({
  id: Identifier,
  fromEntity: ClientEntitySchema,
  toEntity: ClientEntitySchema,
  throughEntity: ClientEntitySchema.optional(),
  type: z.enum(["one-to-one", "one-to-many", "many-to-many"] as const),
  x: z.number().nullish(),
  y: z.number().nullish(),
});

let UI = z.object({
  name: z.literal("Tables App"),
  entities: z.array(ClientEntitySchema),
  relations: z.array(ClientRelationSchema),
  placementMode: z.boolean().default(false),
  ghostPosition: z.object({
    x: z.number(),
    y: z.number(),
  }),
});
