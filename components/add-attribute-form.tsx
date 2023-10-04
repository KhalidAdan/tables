import useAppStore from "@/lib/store";
import { AttributeType, EntityType } from "@/schemas/tables-schema";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { AttributeTypeSelect } from "./attribute";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { TypographyMuted } from "./ui/typography";

export default function AddAttributeForm({
  entity,
}: {
  entity: Pick<EntityType, "data"> & { id: EntityType["id"] };
}) {
  const [primaryKey, setPrimaryKey] = useState<boolean>(false);
  const { addAttributeToEntity, deleteEntityFromModel } = useAppStore();

  const form = useForm<AttributeType>({
    criteriaMode: "all",
    defaultValues: {
      name: "",
      default: "",
      primaryKey: false,
      nullable: false,
      unique: false,
    },
  });
  const onSubmit: SubmitHandler<AttributeType> = (values: AttributeType) => {
    const randomUuid = crypto.randomUUID();
    addAttributeToEntity(entity.id, {
      ...values,
      id: randomUuid,
    });
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <TypographyMuted>
          Add an attribute to your entity or delete an entity below.
        </TypographyMuted>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="name">Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="type">Type</FormLabel>
              <FormControl>
                <AttributeTypeSelect
                  defaultValue={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="default"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="default">Default value</FormLabel>
              <FormControl>
                <Input {...field} disabled={!!primaryKey} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="primaryKey"
          render={({ field }) => (
            <FormItem className="flex gap-1 items-end">
              <FormControl>
                <Checkbox
                  {...field}
                  name={field.name}
                  checked={field.value}
                  value={field.value as any}
                  onCheckedChange={(checked) => {
                    setPrimaryKey(!!checked);

                    const syntheticEvent = {
                      target: {
                        name: field.name,
                        value: checked,
                      },
                    };

                    field.onChange(syntheticEvent);
                  }}
                />
              </FormControl>
              <FormLabel htmlFor="primaryKey">Primary key</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="nullable"
          render={({ field }) => (
            <FormItem className="flex gap-1 items-end">
              <FormControl>
                <Checkbox
                  {...field}
                  name={field.name}
                  checked={field.value}
                  value={field.value as any}
                  onCheckedChange={field.onChange}
                  disabled={primaryKey}
                />
              </FormControl>
              <FormLabel htmlFor="primaryKey">Nullable</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="unique"
          render={({ field }) => (
            <FormItem className="flex gap-1 items-end">
              <FormControl>
                <Checkbox
                  {...field}
                  name={field.name}
                  checked={field.value}
                  value={field.value as any}
                  onCheckedChange={field.onChange}
                  disabled={primaryKey}
                />
              </FormControl>
              <FormLabel htmlFor="primaryKey">
                Unique Constraint on this field
              </FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />
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
      </form>
    </Form>
  );
}
