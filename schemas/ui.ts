import { z } from "zod";
import { Identifier } from ".";

export type ClientEntityType = z.infer<typeof ClientEntity>;
export type MousePositionType = z.infer<typeof MousePosition>;
export type UIType = z.infer<typeof UI>;

const Anchor = z
  .object({
    x: z.number(),
    y: z.number(),
  })
  .nullable();

export const ClientEntity = z.object({
  id: Identifier,
  x: z.number(),
  y: z.number(),
  fromAchor: Anchor,
  toAnchor: Anchor,
});

const MousePosition = z
  .object({
    clientX: z.number(),
    clientY: z.number(),
  })
  .nullable();

export const UI = z.object({
  clientEntities: z.array(ClientEntity),
  placementMode: z.boolean(),
  ghostPosition: MousePosition,
});
