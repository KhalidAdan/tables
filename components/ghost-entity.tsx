"use client";

import { useUIStore } from "@/lib/ui-store";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

export default function GhostEntity() {
  const ref = useRef<HTMLDivElement | null>(null);
  const {
    ui: { ghostPosition, placementMode },
    setGhostPosition,
    setPlacementMode,
  } = useUIStore();

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      setGhostPosition({
        clientX: event.clientX,
        clientY: event.clientY,
      });
    };

    document.addEventListener("mousemove", onMouseMove);

    return () => document.removeEventListener("mousemove", onMouseMove);
  }, [ghostPosition, placementMode, setGhostPosition, setPlacementMode]);

  return (
    <>
      {placementMode && (
        <div
          ref={ref}
          className={cn(
            ghostPosition
              ? "pt-6 px-6 pb-6 rounded-lg border w-96 text-left space-y-4 bg-background opacity-75 dark:opacity-50"
              : "hidden"
          )}
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
