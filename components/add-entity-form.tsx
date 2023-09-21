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
import { EntitySchema, EntityType } from "@/schemas/tables-schema";
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
  const {
    addEntityToModel,
    setPlacementMode,
    model: { ghostPosition },
  } = useAppStore();
  const randomUuid = crypto.randomUUID();
  const form = useForm<EntityType>({
    resolver: zodResolver(EntitySchema),
    criteriaMode: "all",
    defaultValues: {
      id: randomUuid,
      data: {
        name: "",
        attributes: [],
      },
      type: "entity",
      position: {
        x: 0,
        y: 0,
      },
    },
  });

  const onSubmit: SubmitHandler<EntityType> = useCallback((values) => {
    setOpen(false);
    setPlacementMode(true);

    const onMouseUp = (event: MouseEvent) => {
      const latestGhostPosition = useAppStore.getState().model.ghostPosition;
      console.log("latest ghost position", latestGhostPosition);
      console.log("old ghost pos", ghostPosition);
      console.log("latest entity", {
        ...values,
        position: {
          x: latestGhostPosition.x,
          y: latestGhostPosition.y,
        },
      });
      event.stopPropagation();
      event.preventDefault();

      addEntityToModel({
        ...values,
        position: {
          x: latestGhostPosition.x,
          y: latestGhostPosition.y,
        },
      });
      setPlacementMode(false);
      window.removeEventListener("mouseup", onMouseUp, {
        capture: true,
      });
    };
    window.addEventListener("mouseup", onMouseUp, {
      capture: true,
    });
  }, []);

  console.log(form.formState.errors);
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="data.name"
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
