"use client";

import { useUIStore } from "@/lib/ui-store";
import { EntityType } from "@/schemas";
import { useCallback } from "react";
import AddAttributeForm from "./add-attribute-form";
import { Attribute } from "./attribute";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import Draggable from "./ui/draggable";
import { TypographySmall } from "./ui/typography";

type EntityProps = { entity: EntityType };

const Entity = ({ entity }: EntityProps) => {
  const attributes = entity.attributes;
  const hasAttributes = attributes.length > 0;
  const { setAnchor } = useUIStore();

  // TODO: Support SVG relationship lines
  const myCallbackRef = useCallback(
    (node: HTMLDivElement) => {
      if (node !== null) {
        const { x, width, height } = node.getBoundingClientRect();
        const fromAnchor = { x, y: height / 2 };
        const toAnchor = { x: x + width, y: height / 2 };
        setAnchor(entity.id, fromAnchor, toAnchor);
      }
    },
    [entity.id, setAnchor]
  );

  return (
    <Draggable entity={entity}>
      <div
        ref={myCallbackRef}
        className="p-6 rounded-lg border w-[400px] text-left space-y-4 bg-background "
      >
        <section className="-mx-6 -mt-6 pr-4 border-b bg-accent rounded-t-[6px] flex justify-between items-center">
          <div className="pl-4">{entity.name}</div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                Edit
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
            <Attribute
              key={i}
              attribute={attribute}
              entityId={entity.id}
              isLastAttribute={i < attributes.length - 1}
            />
          ))
        ) : (
          <div>
            <TypographySmall>
              No attributes yet. Add one by clicking the edit button above.
            </TypographySmall>
          </div>
        )}
      </div>
    </Draggable>
  );
};

export default Entity;
