import { ClientEntityType, MousePositionType } from "@/schemas/ui";
import { create } from "zustand";

export type State = {
  ui: {
    clientEntities: ClientEntityType[];
    placementMode: boolean;
    ghostPosition: MousePositionType;
    isIntersecting: boolean;
  };
  addClientEntity: (entity: ClientEntityType) => void;
  deleteClientEntity: (entityId: ClientEntityType["id"]) => void;
  setEntityPosition: (
    entityId: ClientEntityType["id"],
    x: ClientEntityType["x"],
    y: ClientEntityType["y"]
  ) => void;
  setAnchor: (
    entityId: ClientEntityType["id"],
    fromAnchor: ClientEntityType["fromAnchor"],
    toAnchor: ClientEntityType["toAnchor"]
  ) => void;
  setPlacementMode: (placementMode: boolean) => void;
  setGhostPosition: (position: MousePositionType) => void;
  setIntersecting: (isIntersecting: boolean) => void;
};

export const checkIsIntersecting = (
  ghostPosition: Pick<ClientEntityType, "x" | "y"> & { w: number; h: number },
  entityPosition: Pick<ClientEntityType, "x" | "y"> & { w: number; h: number }
) => {
  // Calculate bottom-right coordinates for entity A
  const aBottomRightX = ghostPosition.x + ghostPosition.w;
  const aBottomRightY = ghostPosition.y + ghostPosition.h;

  // Calculate bottom-right coordinates for entity B
  const bBottomRightX = entityPosition.x + entityPosition.w;
  const bBottomRightY = entityPosition.y + entityPosition.h;

  return (
    ghostPosition.x < bBottomRightX &&
    aBottomRightX > entityPosition.x &&
    ghostPosition.y < bBottomRightY &&
    aBottomRightY > entityPosition.y
  );
};

export const useUIStore = create<State>((set, get) => ({
  ui: {
    placementMode: false,
    ghostPosition: null,
    clientEntities: [],
    isIntersecting: false,
  },
  addClientEntity: (entity) =>
    set((state) => ({
      ui: {
        ...state.ui,
        clientEntities: [...state.ui.clientEntities, entity],
      },
    })),
  deleteClientEntity: (entityId: ClientEntityType["id"]) =>
    set((state) => ({
      ui: {
        ...state.ui,
        clientEntities: state.ui.clientEntities.filter(
          (entity) => entity.id !== entityId
        ),
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
              fromAnchor: null,
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
              fromAnchor: fromAnchor,
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
  setIntersecting: (isIntersecting) =>
    set((state) => ({
      ui: {
        ...state.ui,
        isIntersecting,
      },
    })),
}));
