import { create } from "zustand";

type MousePosition = {
  clientX: number;
  clientY: number;
} | null;

export type State = {
  placementMode: boolean;
  ghostPosition: MousePosition;
  setPlacementMode: (placementMode: boolean) => void;
  setGhostPosition: (position: MousePosition) => void;
};

export const useUIStore = create<State>((set, get) => ({
  placementMode: false,
  ghostPosition: null,

  setPlacementMode: (placementMode) => set({ placementMode }),
  setGhostPosition: (ghostPosition) => set({ ghostPosition }),
}));
