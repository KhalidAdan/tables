import useAppStore from "@/lib/store";
import { AttributeType, EntityType } from "@/schemas";
import { SubmitHandler, useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export default function AddAttributeForm({ entity }: { entity: EntityType }) {
  // TODO: disallow primary key fields to be nullable
  const { addAttributeToEntity } = useAppStore();
  const randomUuid = crypto.randomUUID();
  const form = useForm<AttributeType>({
    criteriaMode: "all",
    defaultValues: {
      id: randomUuid,
      name: "",
      primaryKey: false,
      nullable: false,
      unique: false,
    },
  });
  const onSubmit: SubmitHandler<AttributeType> = (values: AttributeType) => {
    addAttributeToEntity(entity.id, values);
  };
  console.log(form.formState.errors);
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Select attribute type</SelectLabel>
                      <SelectItem value="identifier">Identifier</SelectItem>
                      <SelectItem value="string">String</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="datetime">Datetime</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
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
                <Input {...field} />
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
                  onCheckedChange={field.onChange}
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
                />
              </FormControl>
              <FormLabel htmlFor="primaryKey">
                Unique Constraint on this field
              </FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Add Attribute</Button>
      </form>
    </Form>
  );
}
