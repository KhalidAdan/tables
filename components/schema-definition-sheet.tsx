"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import useAppStore from "@/lib/store";
import { useUIStore } from "@/lib/ui-store";
import { useState } from "react";
import { highlight } from "sql-highlight";
import { Button } from "./ui/button";
import { Icons } from "./ui/icons";

export default function SchemaDefinitionSheet({
  sheetTrigger,
  target,
  schema,
}: {
  sheetTrigger: React.ReactNode;
  target: "postgres" | "mysql" | "prisma";
  schema: string;
}) {
  const [icon, setIcon] = useState<React.ReactNode>(<Icons.copy />);
  const { addEntityToModel } = useAppStore();
  const { addClientEntity } = useUIStore();
  return (
    <Sheet>
      <SheetTrigger asChild>{sheetTrigger}</SheetTrigger>
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
                name: "Student",
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
              addClientEntity({
                id: id1,
                x: 100,
                y: 100,
                fromAnchor: null,
                toAnchor: null,
              });
              addEntityToModel({
                id: id2,
                name: "Class",
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
              addClientEntity({
                id: id2,
                x: 600,
                y: 100,
                fromAnchor: null,
                toAnchor: null,
              });
            }}
          >
            Add Test Data
          </Button>
        </SheetHeader>

        <div className="flex flex-col mt-2">
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
