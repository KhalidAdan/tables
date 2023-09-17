"use client";

import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useAppStore from "@/lib/store";
import { cn } from "@/lib/utils";
import { AttributeType, EntityType, attributes } from "@/schemas";
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
        "grid grid-cols-3 gap-4 pb-4 space-y-1 last:pb-0 -mx-6 px-6",
        isLastAttribute ? "border-b" : ""
      )}
    >
      <div className="flex gap-4 col-span-3">
        <div className="w-full flex gap-3 items-center">
          {attribute.relationKey ? (
            <AttributeTypeBadge isRelation name={attribute.name} />
          ) : (
            <AttributeTypeSelect
              attribute={attribute}
              value={attribute.type}
              onChange={(value) =>
                editAttributeType(entityId, attribute.id, value)
              }
            />
          )}
          <Input
            defaultValue={attribute.name}
            onChange={(event) => console.log(event)}
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
      </div>
      {!attribute.primaryKey && (
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
      {!attribute.primaryKey && (
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
  );
};

const AttributeTypeBadge = ({
  name,
  isRelation,
}: {
  name: AttributeType["name"];
  isRelation?: boolean;
}) => (
  <Badge
    variant="outline"
    className={cn("cursor-move", isRelation && "bg-green-600")}
  >
    {isRelation ? "relation" : name}
  </Badge>
);

export const AttributeTypeSelect = ({
  attribute,
  value,
  onChange,
}: {
  attribute?: AttributeType;
  value: AttributeType["type"];
  onChange: (value: AttributeType["type"]) => void;
}) => {
  const selectedAttribute = attribute
    ? attributes.find((attr) => attr === attribute.type)
    : undefined;

  return (
    <Select
      defaultValue={selectedAttribute ?? undefined}
      value={value}
      onValueChange={onChange}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {attributes.map((key) => (
            <SelectItem key={key} value={key} className="capitalize">
              <span className="mr-2">{key}</span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
