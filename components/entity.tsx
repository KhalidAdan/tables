"use client";

import useAppStore from "@/lib/store";
import { cn } from "@/lib/utils";
import { EntityType } from "@/schemas";
import { useCallback } from "react";
import AddAttributeForm from "./add-attribute-form";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import Draggable from "./ui/draggable";
import { Icons } from "./ui/icons";
import { Input } from "./ui/input";
import { TypographySmall } from "./ui/typography";

type EntityProps = { entity: EntityType };

export default function Entity({ entity }: EntityProps) {
  const attributes = entity.attributes;
  const hasAttributes = attributes.length > 0;
  const { deleteAttributeFromEntity, setAnchor } = useAppStore();
  const myCallbackRef = useCallback((node: HTMLDivElement) => {
    if (node !== null) {
      const { x, width, height } = node.getBoundingClientRect();
      const fromAnchor = { x, y: height / 2 };
      const toAnchor = { x: x + width, y: height / 2 };
      setAnchor(entity.id, fromAnchor, toAnchor);
    }
  }, []);
  return (
    <Draggable entity={entity}>
      <div className="relative">
        <svg
          className="bg-blue-300 h-4 w-4 absolute rounded-full"
          style={{
            top: entity.fromAnchor?.y,
            left: "-2%",
          }}
        ></svg>
        <svg
          className="bg-blue-300 h-4 w-4 absolute rounded-full"
          style={{
            top: entity.toAnchor?.y,
            left: "98%",
          }}
        ></svg>
      </div>
      <div
        ref={myCallbackRef}
        className="pt-6 px-6 rounded-lg border w-96 text-left space-y-4 bg-background "
      >
        <section className="-mx-6 -mt-6 border-b bg-accent rounded-t-lg pt-2 pl-6 pr-1 flex justify-between items-center">
          <div>{entity.name}</div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Icons.add />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Attribute</DialogTitle>
              </DialogHeader>
              <AddAttributeForm entity={entity} />
            </DialogContent>
          </Dialog>
        </section>
        {hasAttributes ? (
          attributes.map((attribute, i) => (
            <div
              key={attribute.id}
              className={cn(
                "-mx-6 px-6 pb-4",
                i < attributes.length - 1 && "border-b"
              )}
            >
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Badge>{attribute.type}</Badge>
                </div>
                <Input defaultValue={attribute.name} disabled />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    deleteAttributeFromEntity(entity.id, attribute.id)
                  }
                >
                  <Icons.trash />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="pb-4">
            <TypographySmall>
              No attributes! Add one by clicking the plus button above.
            </TypographySmall>
          </div>
        )}
      </div>
    </Draggable>
  );
}
