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

export let meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

let nodeTypes = { entity: Entity };

export default function Index() {
  let { model, onNodesChange, setTarget } = useAppStore();
  let edges = useMemo(() => {
    let createEdge = (
      id: string,
      source: string,
      target: string,
      relationType: string
    ): Edge => ({
      id,
      source,
      target,
      animated: true,
      type: "smoothstep",
      className: "fill-green-500 font-bold",
      label: relationType,
      labelBgPadding: [8, 4],
      labelBgBorderRadius: 4,
      labelBgStyle: {
        fill: "white",
        stroke: "green",
        strokeWidth: 1,
      },
    });

    let edges: Edge[] = [];

    for (let relation of model.relations) {
      if (relation.type === "many-to-many") {
        if (!relation.throughEntity) throw new Error("No through entity found");

        edges.push(
          createEdge(
            `${relation.id}-1`,
            relation.fromEntity.id,
            relation.throughEntity.id,
            "1 : M"
          ),
          createEdge(
            `${relation.id}-2`,
            relation.toEntity.id,
            relation.throughEntity.id,
            "1 : M"
          )
        );
      } else {
        edges.push(
          createEdge(
            relation.id,
            relation.fromEntity.id,
            relation.toEntity.id,
            relation.type === "one-to-one" ? "1 : 1" : "1 : M"
          )
        );
      }
    }

    return edges;
  }, [model.relations]);

  return (
    <main className="h-full">
      <div className="fixed right-0 top-0 m-6 z-50 p-2 rounded-lg border bg-background">
        <div className="flex gap-4">
          <div className="border-r -m-2"></div>
          <AddEntityOrRelation disabled={false} />
          <Select
            defaultValue="prisma"
            onValueChange={(
              value: "postgres" | "mysql" | "sqlite" | "prisma"
            ) => {
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
                <SelectItem value="prisma">Prisma (RDBMS)</SelectItem>
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
      >
        <Background gap={25} />
        <Controls />
      </ReactFlow>
      {model.placementMode && <GhostEntity />}
    </main>
  );
}
