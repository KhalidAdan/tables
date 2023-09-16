"use client";

import { useUIStore } from "@/lib/ui-store";
import { ClientEntityType } from "@/schemas/ui";
import React, { MouseEventHandler } from "react";

export default function Draggable({
  children,
  entity,
}: {
  children: React.ReactNode;
  entity: ClientEntityType;
}) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const { setEntityPosition } = useUIStore();
  const nty = useUIStore
    .getState()
    .ui.clientEntities.find((e) => e.id === entity.id);

  const handleMouseDown: MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
    if (ref.current) {
      const startX = event.clientX - ref.current.getBoundingClientRect().left;
      const startY = event.clientY - ref.current.getBoundingClientRect().top;

      const onMouseMove = (event: MouseEvent) => {
        const newX = event.clientX - startX;
        const newY = event.clientY - startY;
        setEntityPosition(entity.id, newX, newY);
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    }
  };

  return (
    <div
      ref={ref}
      data-entity-id={nty?.id}
      className="w-min h-min z-10 p-4 "
      onMouseDown={handleMouseDown}
      style={{
        position: "absolute",
        left: `${nty?.x}px`,
        top: `${nty?.y}px`,
        cursor: "grab",
      }}
    >
      {children}
    </div>
  );
}
