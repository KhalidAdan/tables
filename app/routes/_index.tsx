import AddEntityOrRelation from "@/components/state/add-entity-or-relationship-dialogue";
import Entity from "@/components/state/entity";
import GhostEntity from "@/components/state/ghost-entity";
import SchemaDefinitionSheet from "@/components/state/schema-definition-sheet";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useAppStore from "@/lib/store";
import type { MetaFunction } from "@remix-run/node";
import { useMemo } from "react";
import ReactFlow, { Background, Controls, Edge } from "reactflow";

import "reactflow/dist/style.css";

export let meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

const nodeTypes = { entity: Entity };

export default function Index() {
  const { model, onNodesChange, setTarget } = useAppStore();
  const edges = useMemo(() => {
    const createEdge = (id: string, source: string, target: string): Edge => ({
      id,
      source,
      target,
      animated: true,
      type: "smoothstep",
      className: "fill-green-500 font-bold",
      label: "1 : M",
      labelBgPadding: [8, 4],
      labelBgBorderRadius: 4,
      labelBgStyle: {
        fill: "white",
        stroke: "green",
        strokeWidth: 1,
      },
    });

    const edges: Edge[] = [];

    for (const relation of model.relations) {
      if (relation.type === "many-to-many") {
        if (!relation.throughEntity) throw new Error("No through entity found");

        edges.push(
          createEdge(
            `${relation.id}-1`,
            relation.fromEntity.id,
            relation.throughEntity.id
          ),
          createEdge(
            `${relation.id}-2`,
            relation.toEntity.id,
            relation.throughEntity.id
          )
        );
      } else {
        edges.push(
          createEdge(relation.id, relation.fromEntity.id, relation.toEntity.id)
        );
      }
    }

    return edges;
  }, [model.relations]);

  return (
    <main className="h-full">
      <div className="fixed right-0 top-0 m-6 z-50 p-2 rounded-lg border bg-background transform-gpu">
        <div className="flex gap-4">
          <div className="border-r -m-2"></div>
          <AddEntityOrRelation disabled={false} />
          <Select
            defaultValue="postgres"
            onValueChange={(value: "postgres" | "mysql") => {
              setTarget(value);
            }}
          >
            <SelectTrigger className="w-[180px] rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-lg">
              <SelectGroup>
                <SelectLabel>Select Target</SelectLabel>
                <SelectItem value="postgres">PostgreSQL</SelectItem>
                <SelectItem value="mysql">MySQL</SelectItem>
                <SelectItem value="sqlite">SQLite</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <SchemaDefinitionSheet target={model.target} />
        </div>
      </div>
      <ReactFlow
        nodes={model.entities}
        edges={edges}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        nodeTypes={nodeTypes as any}
        onNodesChange={onNodesChange}
        fitView
        defaultViewport={{
          zoom: 1,
          x: 0,
          y: 0,
        }}
        minZoom={-1}
        maxZoom={3}
        proOptions={{
          hideAttribution: true,
        }}
      >
        <Background gap={25} />
        <Controls />
      </ReactFlow>
      {model.placementMode && <GhostEntity />}
    </main>
  );
}
