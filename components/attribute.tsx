"use client";

import useAppStore from "@/lib/store";
import { cn } from "@/lib/utils";
import { AttributeType, EntityType } from "@/schemas";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Icons } from "./ui/icons";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

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
        <div className="flex gap-4 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
          <Badge variant="outline" className="cursor-pointer">
            {attribute.type}
          </Badge>
          <Input
            defaultValue={attribute.name}
            className="border-none ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 py-0 h-6"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => deleteAttributeFromEntity(entityId, attribute.id)}
        >
          <Icons.trash size="16" />
        </Button>
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
