"use client";

import { DndContext, type DndContextProps } from "@dnd-kit/core";

export function DndProvider({ children, ...props }: DndContextProps) {
  return <DndContext {...props}>{children}</DndContext>;
}
