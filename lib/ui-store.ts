import { ClientEntityType, MousePositionType } from "@/schemas/ui";
import { create } from "zustand";

export type State = {
  ui: {
    clientEntities: ClientEntityType[];
    placementMode: boolean;
    ghostPosition: MousePositionType;
  };
  addClientEntity: (entity: ClientEntityType) => void;
  setEntityPosition: (
    entityId: ClientEntityType["id"],
    x: ClientEntityType["x"],
    y: ClientEntityType["y"]
  ) => void;
  setAnchor: (
    entityId: ClientEntityType["id"],
    fromAnchor: ClientEntityType["fromAchor"],
    toAnchor: ClientEntityType["toAnchor"]
  ) => void;
  setPlacementMode: (placementMode: boolean) => void;
  setGhostPosition: (position: MousePositionType) => void;
};

export const useUIStore = create<State>((set, get) => ({
  ui: {
    placementMode: false,
    ghostPosition: null,
    clientEntities: [],
  },
  addClientEntity: (entity) =>
    set((state) => ({
      ui: {
        ...state.ui,
        clientEntities: [...state.ui.clientEntities, entity],
      },
    })),

  setEntityPosition: (entityId, x, y) => {
    const entities = get().ui.clientEntities;
    if (entities.length === 0)
      set((state) => ({
        ui: {
          ...state.ui,
          clientEntities: [
            {
              id: entityId,
              x,
              y,
              fromAchor: null,
              toAnchor: null,
            },
          ],
        },
      }));
    else
      set((state) => ({
        ui: {
          ...state.ui,
          clientEntities: state.ui.clientEntities.map((entity) => {
            if (entity.id === entityId) {
              return {
                ...entity,
                x,
                y,
              };
            }
            return entity;
          }),
        },
      }));
  },
  setAnchor: (entityId, fromAnchor, toAnchor) => {
    set((state) => ({
      ui: {
        ...state.ui,
        clientEntities: state.ui.clientEntities.map((entity) => {
          if (entity.id === entityId) {
            return {
              ...entity,
              fromAchor: fromAnchor,
              toAnchor,
            };
          }
          return entity;
        }),
      },
    }));
  },
  setPlacementMode: (placementMode) =>
    set((state) => ({
      ui: {
        ...state.ui,
        placementMode,
      },
    })),
  setGhostPosition: (ghostPosition) =>
    set((state) => ({
      ui: {
        ...state.ui,
        ghostPosition,
      },
    })),
}));
