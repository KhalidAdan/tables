"use client";

import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
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

export default function SchemaDefinitionSheet({
  target,
}: {
  target: "postgres" | "mysql" | "sqlite" | "prisma";
}) {
  let [icon, setIcon] = useState<React.ReactNode>(<Icons.copy />);
  let [schema, setSchema] = useState<string>("");
  let { generateSchema, addEntityToModel } = useAppStore();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-lg"
          onClick={(e) => {
            e.stopPropagation();
            setSchema(generateSchema());
          }}
        >
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
              let id1 = crypto.randomUUID();
              let id2 = crypto.randomUUID();
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
                      nullable: false,
                      default:
                        target === "postgres" || target == "prisma"
                          ? "NOW()"
                          : "CURRENT_TIMESTAMP",
                    },
                    {
                      id: crypto.randomUUID(),
                      name: "Updated At",
                      type: "date",
                      primaryKey: false,
                      unique: false,
                      nullable: true,
                      default:
                        target === "postgres" || target == "prisma"
                          ? "NOW()"
                          : "CURRENT_TIMESTAMP",
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
                      nullable: false,
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
                  x: -100,
                  y: 600,
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
            {target !== "prisma" && (
              <code
                dangerouslySetInnerHTML={{
                  __html: highlight(schema, {
                    html: true,
                  }),
                }}
              ></code>
            )}
            {target === "prisma" && (
              <code
                dangerouslySetInnerHTML={{
                  __html: schema,
                }}
              ></code>
            )}
          </pre>
        </div>
      </SheetContent>
    </Sheet>
  );
}
