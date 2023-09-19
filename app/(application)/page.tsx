"use client";

import AddEntityOrRelation from "@/components/add-entity-or-realtionship-dialogue";
import Entity from "@/components/entity";
import SchemaDefinitionSheet from "@/components/schema-definition-sheet";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ModeToggle } from "@/components/ui/theme-toggle";
import useAppStore from "@/lib/store";

import { useEffect, useMemo } from "react";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";

// TODO: Check constraints
// TODO: ON Delete behaviour for relations (cascade, restrict, etc)
// TODO: form parsing, general tidying up
// TODO: right now, the schema generation relies on primary keys existing, so we need to disallow deleting attributes on FROM models that contribute to a relationship
// TODO: Relationship lines and crow's feet
// TODO: Drag handle for sidebar?
// TODO: Command pallette for quick actions? What would that look like?

const nodeTypes = { entity: Entity };

export default function HomePage() {
  const { model, nodes, onNodesChange, setTarget, generateSchema } =
    useAppStore();

  useEffect(() => {
    console.log("Nodes changed:", nodes);
  }, [nodes]);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- only generate schema when model changes, not on drag or any other such behaviour
  const schema = useMemo(() => generateSchema(), [model, generateSchema]);

  return (
    <main className="h-full">
      <div className="absolute right-4 top-4 flex flex-col items-end gap-4 z-50">
        <ModeToggle />
        <div className="flex gap-4">
          <AddEntityOrRelation disabled={false} />
          <Select
            defaultValue="postgres"
            onValueChange={(value: "postgres" | "mysql") => {
              setTarget(value);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Select Target</SelectLabel>
                <SelectItem value="postgres">PostgreSQL</SelectItem>
                <SelectItem value="mysql">MySQL</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <SchemaDefinitionSheet
            target={model.target}
            schema={schema}
            sheetTrigger={
              <Button variant="outline" size="icon">
                <Icons.hamburger />
              </Button>
            }
          />
        </div>
      </div>
      <ReactFlow
        nodes={nodes}
        nodeTypes={nodeTypes as any}
        onNodesChange={onNodesChange}
        fitView
        proOptions={{
          hideAttribution: true,
        }}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </main>
  );
}
