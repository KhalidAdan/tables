"use client";

import { useIsEntityIntersecting } from "@/lib/hooks/use-entity-intersecting";
import { useGhostPosition } from "@/lib/hooks/use-ghost-position";
import { useUIStore } from "@/lib/ui-store";
import { cn } from "@/lib/utils";
import { useRef } from "react";

export default function GhostEntity() {
  const ref = useRef<HTMLDivElement | null>(null);
  const {
    ui: { ghostPosition, placementMode, clientEntities, isIntersecting },
    setGhostPosition,
    setPlacementMode,
    setIntersecting,
  } = useUIStore();

  useIsEntityIntersecting(ref, ghostPosition, clientEntities, setIntersecting);
  useGhostPosition(
    setGhostPosition,
    ghostPosition,
    placementMode,
    setPlacementMode
  );

  return (
    <>
      {placementMode && (
        <div
          ref={ref}
          className={cn(
            ghostPosition
              ? "pt-6 px-6 pb-6 rounded-lg border w-96 text-left space-y-4 opacity-75"
              : "hidden",
            isIntersecting ? "bg-[red]/25" : "bg-background",
            "z-50"
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
          <section className="-mx-6 -mt-6 w-96 border-b bg-accent rounded-t-lg pt-2 pl-6 pr-1 flex justify-between items-center opacity-50">
            <div>New entity</div>
          </section>
          <p>Place your entity to start editing it&apos;s attributes!</p>
        </div>
      )}
    </>
  );
}
