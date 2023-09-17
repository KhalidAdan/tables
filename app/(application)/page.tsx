"use client";

import AddEntityOrRelation from "@/components/add-entity-or-realtionship-dialogue";
import Entity from "@/components/entity";
import GhostEntity from "@/components/ghost-entity";
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
import { useUIStore } from "@/lib/ui-store";
import { useMemo } from "react";

// TODO: Check constraints
// TODO: ON Delete behaviour for relations (cascade, restrict, etc)
// TODO: form parsing, general tidying up
// TODO: right now, the schema generation relies on primary keys existing, so we need to disallow deleting attributes on FROM models that contribute to a relationship
// TODO: Relationship lines and crow's feet
// TODO: Drag handle for sidebar?
// TODO: Command pallette for quick actions? What would that look like?

export default function HomePage() {
  const { model, setTarget, generateSchema } = useAppStore();
  const {
    ui: { placementMode },
  } = useUIStore();

  // eslint-disable-next-line react-hooks/exhaustive-deps -- only generate schema when model changes, not on drag or any other such behaviour
  const schema = useMemo(() => generateSchema(), [model, generateSchema]);

  return (
    <main className="h-full">
      <div className="absolute right-4 top-4 flex flex-col items-end gap-4 z-50">
        <ModeToggle />
        <div className="flex gap-4">
          <AddEntityOrRelation disabled={placementMode} />
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
      <section className="">
        {model.entities.map((entity, i) => {
          return <Entity key={i} entity={entity} />;
        })}
      </section>
      {placementMode && <GhostEntity />}
    </main>
  );
}
