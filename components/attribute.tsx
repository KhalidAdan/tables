"use client";

import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useAppStore, { getRelationById } from "@/lib/store";
import { cn, produceRelationTypeLabel } from "@/lib/utils";
import { AttributeType, EntityType, attributes } from "@/schemas/tables-schema";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Icons } from "./ui/icons";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select } from "./ui/select";

export const Attribute = ({
  attribute,
  entityId,
  isLastAttribute,
}: {
  attribute: AttributeType;
  entityId: EntityType["id"];
  isLastAttribute: boolean;
}) => {
  const {
    deleteAttributeFromEntity,
    setAttributeUnique,
    setAttributeNullable,
    editAttributeType,
  } = useAppStore();

  return (
    <div
      data-testid="attribute"
      data-attribute-name={attribute.name}
      className={cn(
        "pb-4 space-y-1 last:pb-0 -mx-6 px-6",
        isLastAttribute ? "border-b" : ""
      )}
    >
      <div className="grid grid-cols-6 gap-2 items-center">
        {attribute.relationKey ? (
          <div className="col-span-1">
            <RelationTypeBadge attr={attribute} />
          </div>
        ) : (
          <div className="col-span-2">
            <AttributeTypeSelect
              defaultValue={attribute.type}
              onChange={(value) =>
                editAttributeType(entityId, attribute.id, value)
              }
            />
          </div>
        )}
        <Input
          className={cn(!attribute.relationKey ? "col-span-3" : "col-span-4")}
          defaultValue={attribute.name}
          onChange={(event) => {
            const value = event.target.value;
            //editAttributeType(entityId, attribute.id, value); // this needs to be fixed to spread the whole attribute object
          }}
        />
        <Button
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            deleteAttributeFromEntity(entityId, attribute);
          }}
        >
          <Icons.trash size="16" />
        </Button>
      </div>
      <div
        className={cn(
          "flex gap-4",
          !attribute.primaryKey && !attribute.relationKey && "pt-3"
        )}
      >
        {!attribute.primaryKey && !attribute.relationKey && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="unique"
              defaultChecked={attribute.unique}
              onCheckedChange={(checked: boolean) =>
                setAttributeUnique(entityId, attribute.id, checked)
              }
            />
            <Label htmlFor="terms">Unique</Label>
          </div>
        )}
        {!attribute.primaryKey && !attribute.relationKey && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="nullable"
              disabled={attribute.unique}
              defaultChecked={attribute.nullable}
              onCheckedChange={(checked: boolean) =>
                setAttributeNullable(entityId, attribute.id, checked)
              }
            />
            <Label htmlFor="terms">Nullable</Label>
          </div>
        )}
      </div>
    </div>
  );
};

const RelationTypeBadge = ({ attr }: { attr: AttributeType }) => {
  if (!attr.relationKey)
    throw new Error("RelationTypeBadge: relationKey is undefined");

  const state = useAppStore();
  const relation = getRelationById(state, attr.relationKey);
  if (!relation) throw new Error("RelationTypeBadge: relation is undefined");

  const label = produceRelationTypeLabel(relation.type);

  return (
    <Badge
      variant="outline"
      className={cn("cursor-move m-0", attr.relationKey && "bg-green-600")}
    >
      {attr.relationKey ? label : attr.name}
    </Badge>
  );
};

export const AttributeTypeSelect = ({
  defaultValue,
  onChange,
}: {
  defaultValue: AttributeType["type"];
  onChange: (value: AttributeType["type"]) => void;
}) => {
  return (
    <div className="capitalize">
      <Select defaultValue={defaultValue} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="w-min">
          <SelectGroup>
            {attributes.map((key) => (
              <SelectItem key={key} value={key}>
                <span className="mr-2">{key}</span>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};
