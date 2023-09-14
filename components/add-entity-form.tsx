"use client";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import useAppStore from "@/lib/store";
import { EntitySchema, EntityType } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function AddEntityForm() {
  const { addEntityToModel } = useAppStore();
  const randomUuid = crypto.randomUUID();
  const form = useForm<EntityType>({
    resolver: zodResolver(EntitySchema),
    criteriaMode: "all",
    defaultValues: {
      id: randomUuid,
      name: "",
      attributes: [],
      relations: [],
    },
  });
  const onSubmit: SubmitHandler<EntityType> = (values) => {
    addEntityToModel({ ...values });
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
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                This is the name of your database table under the hood.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Add Entity</Button>
      </form>
    </Form>
  );
}
