import { useEffect } from "react";

export function useGhostPosition(
  setGhostPosition: (
    position: { clientX: number; clientY: number } | null
  ) => void,
  ghostPosition: { clientX: number; clientY: number } | null,
  placementMode: boolean,
  setPlacementMode: (placementMode: boolean) => void
) {
  useEffect(() => {
    let onMouseMove = (event: MouseEvent) => {
      setGhostPosition({
        clientX: event.clientX,
        clientY: event.clientY,
      });
    };

    document.addEventListener("mousemove", onMouseMove);

    return () => document.removeEventListener("mousemove", onMouseMove);
  }, [ghostPosition, placementMode, setGhostPosition, setPlacementMode]);
}
