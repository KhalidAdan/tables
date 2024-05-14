import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TypographyMuted, TypographySmall } from "@/components/ui/typography";
import {
  AttributeSchema,
  AttributeType,
  EntityType,
  attributes,
} from "@/lib/schemas/tables-schema";
import useAppStore from "@/lib/store";
import {
  getFormProps,
  getInputProps,
  getSelectProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint } from "@conform-to/zod";
import { Form } from "@remix-run/react";
import { useState } from "react";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";

export default function AddAttributeForm({
  entity,
}: {
  entity: Pick<EntityType, "data"> & { id: EntityType["id"] };
}) {
  let [primaryKey, setPrimaryKey] = useState<boolean>(false);
  let { addAttributeToEntity, deleteEntityFromModel } = useAppStore();

  let [form, fields] = useForm({
    constraint: getZodConstraint(AttributeSchema),
    defaultValue: {
      name: "",
      default: "",
      type: undefined,
      primaryKey: false,
      nullable: false,
      unique: false,
    },
  });

  return (
    <Form
      {...getFormProps(form)}
      className="space-y-4"
      navigate={false}
      fetcherKey="add-attribute-form"
      onSubmit={(e) => {
        let formData = new FormData(e.currentTarget);
        let values = Object.fromEntries(formData.entries());

        let randomUuid = crypto.randomUUID() as string;
        let attribute: AttributeType = {
          name: values.name as AttributeType["name"],
          type: values.type as AttributeType["type"],
          default: values.default as AttributeType["default"],
          nullable: values.nullable === "on",
          unique: values.unique === "on",
          primaryKey: values.primaryKey === "on",
          relationKey: values.relationKey as AttributeType["relationKey"],
          id: randomUuid as AttributeType["id"],
        };

        if (!values.name || !values.type) {
          alert("Name and Type are required");
          return;
        }

        addAttributeToEntity(entity.id, attribute);
      }}
    >
      <div className="space-y-1 mb-2 w-full">
        <TypographySmall>
          Would you like to add common attributes (ID, Created At and Updated
          At)?
        </TypographySmall>
        <Button
          variant="default"
          className="w-full"
          onClick={(e) => {
            e.preventDefault();
            addAttributeToEntity(entity.id, {
              name: "ID",
              type: "identifier",
              nullable: false,
              unique: true,
              primaryKey: true,
              id: crypto.randomUUID() as AttributeType["id"],
            });
            addAttributeToEntity(entity.id, {
              name: "Created At",
              type: "timestamp",
              nullable: false,
              unique: false,
              primaryKey: false,
              id: crypto.randomUUID() as AttributeType["id"],
            });
            addAttributeToEntity(entity.id, {
              name: "Updated At",
              type: "timestamp",
              nullable: false,
              unique: false,
              primaryKey: false,
              id: crypto.randomUUID() as AttributeType["id"],
            });
          }}
        >
          Add common attributes
        </Button>
      </div>
      <Separator />
      <TypographyMuted>
        Add an attribute to your entity or delete an entity below.
      </TypographyMuted>

      <div className="space-y-1">
        <Label htmlFor="name">Name</Label>
        <Input {...getInputProps(fields.name, { type: "text" })} />
      </div>

      <div className="space-y-1">
        <Label htmlFor="type">Type</Label>
        <select
          {...getSelectProps(fields.type)}
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
        >
          {attributes.map((key) => (
            <option key={key} value={key} className="capitalize">
              {key}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="default">Default value</Label>
        <Input
          {...getInputProps(fields.default, { type: "text" })}
          disabled={!!primaryKey}
        />
      </div>

      <div className="space-y-1 flex items-end gap-2">
        <Checkbox
          {...getInputProps(fields.primaryKey, { type: "checkbox" })}
          onCheckedChange={(checked) => setPrimaryKey(checked as boolean)}
        />
        <Label htmlFor="primaryKey">Primary key</Label>
      </div>

      <div className="space-y-1 flex items-end gap-2 accent-background">
        <Checkbox
          {...getInputProps(fields.nullable, { type: "checkbox" })}
          disabled={primaryKey}
        />
        <Label htmlFor="nullable">Nullable</Label>
      </div>

      <div className="space-y-1 flex items-end gap-2 accent-background">
        <Checkbox
          {...getInputProps(fields.unique, { type: "checkbox" })}
          disabled={primaryKey}
        />
        <Label htmlFor="unique">Unique Constraint on this field</Label>
      </div>

      <div className="flex justify-between">
        <Button type="submit">Add Attribute</Button>
        <Button
          type="button"
          variant="destructive"
          onClick={() => {
            if (
              confirm("Are you sure? This could royally mess up your schema!")
            ) {
              deleteEntityFromModel(entity.id);
            }
          }}
        >
          Delete Entity
        </Button>
      </div>
    </Form>
  );
}
