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
import { useCallback } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function AddEntityForm({
  setOpen,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { addEntityToModel, addNode } = useAppStore();
  const randomUuid = crypto.randomUUID();
  const form = useForm<EntityType>({
    resolver: zodResolver(EntitySchema),
    criteriaMode: "all",
    defaultValues: {
      id: randomUuid,
      name: "",
      attributes: [],
    },
  });

  const onSubmit: SubmitHandler<EntityType> = useCallback(
    (values) => {
      setOpen(false);
      addEntityToModel({
        ...values,
      });
      addNode({
        id: values.id,
        type: "entity",
        position: {
          x: 0,
          y: 0,
        },
        data: {
          id: values.id,
          name: values.name,
          attributes: [],
        },
      });
    },
    [addEntityToModel, setOpen, addNode]
  );

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
