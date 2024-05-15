import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Icons } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AttributeType,
  EntityType,
  attributes,
} from "@/lib/schemas/tables-schema";
import useAppStore, { getRelationById } from "@/lib/store";
import { cn, produceRelationTypeLabel } from "@/lib/utils";

export let Attribute = ({
  attribute,
  entityId,
  isLastAttribute,
}: {
  attribute: AttributeType;
  entityId: EntityType["id"];
  isLastAttribute: boolean;
}) => {
  let {
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
          // onChange={(event) => {
          //let value = event.target.value;
          //editAttributeType(entityId, attribute.id, value); // this needs to be fixed to spread the whole attribute object
          // }}
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

let RelationTypeBadge = ({ attr }: { attr: AttributeType }) => {
  let state = useAppStore();
  if (!attr.relationKey) return null;
  let relation = getRelationById(state, attr.relationKey);
  if (!relation) return null;

  let label = produceRelationTypeLabel(relation.type);

  return (
    <Badge
      variant="outline"
      className={cn("cursor-move m-0", attr.relationKey && "bg-green-600")}
    >
      {attr.relationKey ? label : attr.name}
    </Badge>
  );
};

export let AttributeTypeSelect = ({
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
