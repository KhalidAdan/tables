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
import { useEffect } from "react";

// TODO: Relationship lines and crow's feet
// TODO: Drag handle for sidebar
// TODO: Command pallette for quick actions?

export default function HomePage() {
  const { model, setTarget, addEntityToModel, generateSchema } = useAppStore();

  // add test entity, TODO: remove
  useEffect(() => {
    console.log("adding model");
    addEntityToModel({
      id: crypto.randomUUID(),
      name: "Student",
      x: 100,
      y: 100,
      fromAnchor: null,
      toAnchor: null,
      attributes: [
        {
          id: crypto.randomUUID(),
          name: "ID",
          type: "identifier",
          primaryKey: true,
          unique: false,
          nullable: false,
        },
        {
          id: crypto.randomUUID(),
          name: "Email",
          type: "string",
          primaryKey: false,
          unique: true,
          nullable: false,
        },
        {
          id: crypto.randomUUID(),
          name: "Phone Number",
          type: "string",
          primaryKey: false,
          unique: false,
          nullable: true,
        },
      ],
    });
    addEntityToModel({
      id: crypto.randomUUID(),
      name: "Class",
      x: 1000,
      y: 100,
      fromAnchor: null,
      toAnchor: null,
      attributes: [
        {
          id: crypto.randomUUID(),
          name: "ID",
          type: "identifier",
          primaryKey: true,
          unique: false,
          nullable: false,
        },
        {
          id: crypto.randomUUID(),
          name: "Name of Class",
          type: "string",
          primaryKey: false,
          unique: false,
          nullable: false,
        },
      ],
    });
  }, []);
  console.log(model);
  const schema = generateSchema();

  return (
    <main className="h-full">
      <div className="absolute right-4 top-4 flex flex-col items-end gap-4">
        <ModeToggle />
        <div className="flex gap-4">
          <AddEntityOrRelation
            trigger={
              <Button variant="outline" size="icon">
                <Icons.add />
              </Button>
            }
          />
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
    </main>
  );
}
