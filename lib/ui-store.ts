import { EntityType } from "@/schemas";
import { create } from "zustand";

type MousePosition = {
  clientX: number;
  clientY: number;
} | null;

export type State = {
  clientEntities: Pick<EntityType, "id" | "x" | "y">[];
  placementMode: boolean;
  ghostPosition: MousePosition;
  addClientEntity: (entity: EntityType) => void;
  setEntityPosition: (
    entityId: EntityType["id"],
    x: EntityType["x"],
    y: EntityType["y"]
  ) => void;
  setPlacementMode: (placementMode: boolean) => void;
  setGhostPosition: (position: MousePosition) => void;
};

export const useUIStore = create<State>((set, get) => ({
  placementMode: false,
  ghostPosition: null,
  clientEntities: [],
  addClientEntity: (entity) =>
    set((state) => ({
      clientEntities: [...state.clientEntities, entity],
    })),

  setEntityPosition: (entityId, x, y) => {
    const entities = get().clientEntities;
    if (entities.length === 0) {
      set((state) => ({
        clientEntities: [
          {
            id: entityId,
            x,
            y,
          },
        ],
      }));
      return;
    }
    set((state) => ({
      clientEntities: state.clientEntities.map((entity) => {
        if (entity.id === entityId) {
          return {
            ...entity,
            x,
            y,
          };
        }
        return entity;
      }),
    }));
  },
  setPlacementMode: (placementMode) => set({ placementMode }),
  setGhostPosition: (ghostPosition) => set({ ghostPosition }),
}));
