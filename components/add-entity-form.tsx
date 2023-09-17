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
import { useUIStore } from "@/lib/ui-store";
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
  const { addEntityToModel } = useAppStore();
  const {
    setGhostPosition,
    setPlacementMode,
    addClientEntity,
    ui: { isIntersecting },
  } = useUIStore();
  const randomUuid = crypto.randomUUID();
  const form = useForm<EntityType>({
    resolver: zodResolver(EntitySchema),
    criteriaMode: "all",
    defaultValues: {
      id: randomUuid,
      name: "",
      attributes: [],
      toAnchor: null,
      fromAnchor: null,
    },
  });

  const onSubmit: SubmitHandler<EntityType> = useCallback(
    (values) => {
      setOpen(false);
      setPlacementMode(true);

      const onMouseUp = () => {
        const latestGhostPosition = useUIStore.getState().ui.ghostPosition;
        if (!latestGhostPosition || isIntersecting) return;

        setGhostPosition(null);
        setPlacementMode(false);

        if (!isIntersecting) {
          addClientEntity({
            id: values.id,
            x: latestGhostPosition.clientX ?? undefined,
            y: latestGhostPosition.clientY ?? undefined,
            fromAnchor: null,
            toAnchor: null,
          });
          addEntityToModel({
            ...values,
          });
        }

        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mouseup", onMouseUp);
    },
    [
      isIntersecting,
      addEntityToModel,
      setOpen,
      setPlacementMode,
      setGhostPosition,
      addClientEntity,
    ]
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
