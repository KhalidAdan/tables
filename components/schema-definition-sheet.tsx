"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
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
  return (
    <Sheet>
      <SheetTrigger asChild>{sheetTrigger}</SheetTrigger>
      <SheetContent side="right" className="!max-w-xl">
        <SheetHeader>
          <SheetTitle className="capitalize flex justify-between">
            {target} Schema
          </SheetTitle>
        </SheetHeader>
        <div className="absolute right-8 top-16">
          <Button
            variant="ghost"
            size="icon"
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
        </div>
        <pre className="!max-w-2xl w-xl rounded-lg p-3 overflow-x-scroll h-full bg-background">
          <code dangerouslySetInnerHTML={{ __html: schema }}></code>
        </pre>
      </SheetContent>
    </Sheet>
  );
}
