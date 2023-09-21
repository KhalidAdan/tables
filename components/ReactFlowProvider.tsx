"use client";

import { ReactFlowProvider as Provider } from "reactflow";

export function ReactFlowProvider({ children }: { children: React.ReactNode }) {
  return <Provider>{children}</Provider>;
}
