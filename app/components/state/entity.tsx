"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TypographySmall } from "@/components/ui/typography";
import { EntityType } from "@/lib/schemas/tables-schema";
import { Handle, Position } from "reactflow";
import AddAttributeForm from "./add-attribute-form";
import { Attribute } from "./attribute";

let Entity = (props: EntityType) => {
  let entity = props.data;
  let attributes = entity.attributes;
  let hasAttributes = attributes.length > 0;

  return (
    <div className="px-6 pt-6 pb-2 rounded-lg border w-[400px] text-left space-y-4 bg-background">
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
      <Handle
        type="target"
        position={Position.Left}
        style={{
          border: "none",
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          border: "none",
        }}
      />
    </div>
  );
};

export default Entity;
