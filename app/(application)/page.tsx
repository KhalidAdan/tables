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

// TODO: Deleting entity in relation should delete relation
// TODO; When creating an attribute, if you make an identifier, disable nullable and unique checkboxes
// TODO: right now, the schema generation relies on primaery keys existing, so we need to disaloow deleting attributes on FROM models that contribute to a relationship
// TODO: When adding a relation a the new entity should use the ghost entity
// TODO: continue separating UI concerns over data concerns, right now moving an entity regenerates the schema
// TODO: Relationship lines and crow's feet
// TODO: Drag handle for sidebar?
// TODO: Command pallette for quick actions? What would that look like?

export default function HomePage() {
  const { model, setTarget, generateSchema } = useAppStore();
  const { placementMode } = useUIStore();

  const schema = generateSchema();

  console.log(model.relations);
  console.log(model);

  return (
    <main className="h-full">
      <div className="absolute right-4 top-4 flex flex-col items-end gap-4">
        <ModeToggle />
        <div className="flex gap-4">
          <AddEntityOrRelation />
          <Select
            defaultValue="postgres"
            onValueChange={(value: "postgres" | "mysql") => {
              setTarget(value);
            }}
          >
            <SelectTrigger className="w-[180px] z-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-10">
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
        {model.entities.map((entity, i) => (
          <Entity key={i} entity={entity} />
        ))}
      </section>
      {placementMode && <GhostEntity />}
    </main>
  );
}
