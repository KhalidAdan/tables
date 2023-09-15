"use client";

import useAppStore from "@/lib/store";
import { useUIStore } from "@/lib/ui-store";
import { useEffect } from "react";

export default function GhostEntity() {
  // TODO: remove UI concerns from data conerns in zustand store
  const { model } = useAppStore();
  const { ghostPosition, placementMode, setGhostPosition, setPlacementMode } =
    useUIStore();

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      setGhostPosition({ clientX: event.clientX, clientY: event.clientY });
    };
    const onMouseUp = () => {
      setGhostPosition(null);
      setPlacementMode(false);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [placementMode, setGhostPosition, setPlacementMode]);

  return (
    <>
      {placementMode && (
        <div
          className="pt-6 px-6 pb-6 rounded-lg border w-96 text-left space-y-4 bg-background opacity-50"
          style={
            ghostPosition
              ? {
                  position: "absolute",
                  left: `${ghostPosition.clientX}px`,
                  top: `${ghostPosition.clientY}px`,
                }
              : undefined
          }
        >
          <section className="-mx-6 -mt-6 border-b bg-accent rounded-t-lg pt-2 pl-6 pr-1 flex justify-between items-center opacity-50">
            <div>New entity</div>
          </section>
          <p>Place your entity to start editing it&apos;s attributes!</p>
        </div>
      )}
    </>
  );
}
