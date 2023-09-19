"use client";

import { EntityType } from "@/schemas/tables-schema";
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
import { TypographySmall } from "./ui/typography";

const Entity = (props: EntityType) => {
  const entity = props.data;
  const attributes = entity.attributes;
  const hasAttributes = attributes.length > 0;

  return (
    <div className="p-6 rounded-lg border w-[400px] text-left space-y-4 bg-background ">
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
            <AddAttributeForm
              entity={{
                id: props.id,
                data: props.data,
              }}
            />
          </DialogContent>
        </Dialog>
      </section>
      {hasAttributes ? (
        attributes.map((attribute, i) => (
          <Attribute
            key={i}
            attribute={attribute}
            entityId={props.id}
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
      {/* <Handle type="target" position={Position.Left} className="h-0" />
      <Handle type="source" position={Position.Right} className="h-0" /> */}
    </div>
  );
};

export default Entity;
