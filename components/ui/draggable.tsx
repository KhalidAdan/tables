"use client";

import useAppStore from "@/lib/store";
import { EntityType } from "@/schemas";
import React from "react";

export default function Draggable({
  children,
  entity,
}: {
  children: React.ReactNode;
  entity: EntityType;
}) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const state = useAppStore();

  const handleMouseDown = (event: any) => {
    event.stopPropagation();
    if (ref.current) {
      const startX = event.clientX - ref.current.getBoundingClientRect().left;
      const startY = event.clientY - ref.current.getBoundingClientRect().top;

      const onMouseMove = (event: MouseEvent) => {
        const newX = event.clientX - startX;
        const newY = event.clientY - startY;
        state.setEntityPosition(entity.id, newX, newY);
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
      className="w-min h-min z-10 p-4"
      onMouseDown={handleMouseDown}
      style={{
        position: "absolute",
        left: `${entity.x}px`,
        top: `${entity.y}px`,
        cursor: "grab",
      }}
    >
      {children}
    </div>
  );
}
