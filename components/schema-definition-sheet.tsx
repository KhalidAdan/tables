"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import useAppStore from "@/lib/store";
import { useState } from "react";
import { highlight } from "sql-highlight";
import { Button } from "./ui/button";
import { Icons } from "./ui/icons";

export default function SchemaDefinitionSheet({
  target,
}: {
  target: "postgres" | "mysql" | "sqlite";
}) {
  const [icon, setIcon] = useState<React.ReactNode>(<Icons.copy />);
  const { generateSchema, addEntityToModel } = useAppStore();

  // TODO: This is rendering on ever entitiy change to position, which is not ideal
  const schema = generateSchema();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-lg">
          <Icons.hamburger />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="!max-w-xl">
        <SheetHeader>
          <SheetTitle className="capitalize flex justify-between">
            {target} Schema
          </SheetTitle>
          <Button
            onClick={() => {
              const id1 = crypto.randomUUID();
              const id2 = crypto.randomUUID();
              addEntityToModel({
                id: id1,
                type: "entity",
                data: {
                  name: "Student",
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
                    {
                      id: crypto.randomUUID(),
                      name: "Created At",
                      type: "date",
                      primaryKey: false,
                      unique: false,
                      nullable: true,
                      default:
                        target === "postgres" ? "NOW()" : "CURRENT_TIMESTAMP",
                    },
                    {
                      id: crypto.randomUUID(),
                      name: "Updated At",
                      type: "date",
                      primaryKey: false,
                      unique: false,
                      nullable: true,
                      default:
                        target === "postgres" ? "NOW()" : "CURRENT_TIMESTAMP",
                    },
                  ],
                },
                position: {
                  x: -100,
                  y: 0,
                },
              });
              addEntityToModel({
                id: id2,
                data: {
                  name: "Class",
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
                    {
                      id: crypto.randomUUID(),
                      name: "Code",
                      type: "string",
                      primaryKey: false,
                      unique: true,
                      nullable: false,
                    },
                    {
                      id: crypto.randomUUID(),
                      name: "Created At",
                      type: "date",
                      primaryKey: false,
                      unique: false,
                      nullable: true,
                      default:
                        target === "postgres" ? "NOW()" : "CURRENT_TIMESTAMP",
                    },
                    {
                      id: crypto.randomUUID(),
                      name: "Updated At",
                      type: "date",
                      primaryKey: false,
                      unique: false,
                      nullable: true,
                      default:
                        target === "postgres" ? "NOW()" : "CURRENT_TIMESTAMP",
                    },
                  ],
                },
                type: "entity",
                position: {
                  x: 450,
                  y: 0,
                },
              });
            }}
          >
            Add Test Data
          </Button>
        </SheetHeader>

        <div className="flex flex-col mt-2 overflow-auto">
          <Button
            variant="ghost"
            size="icon"
            className="self-end"
            onClick={async () => {
              await navigator.clipboard.writeText(schema).finally(() => {
                setIcon(<Icons.check />);
                setTimeout(() => {
                  setIcon(<Icons.copy />);
                }, 2000);
              });
            }}
          >
            {icon}
          </Button>
          <pre className="!max-w-2xl w-xl rounded-lg p-3 overflow-x-scroll h-full bg-background">
            <code
              dangerouslySetInnerHTML={{
                __html: highlight(schema, {
                  html: true,
                }),
              }}
            ></code>
          </pre>
        </div>
      </SheetContent>
    </Sheet>
  );
}
