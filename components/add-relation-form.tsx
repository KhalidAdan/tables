"use client";

import useAppStore from "@/lib/store";
import {
  AddRelationFormProps,
  AddRelationFormSchema,
  relations,
} from "@/schemas/tables-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export function AddRelationForm({
  setOpen,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { model, addRelationToModel, setPlacementMode } = useAppStore();

  const randomUuid = crypto.randomUUID();
  const form = useForm<AddRelationFormProps>({
    resolver: zodResolver(AddRelationFormSchema),
    defaultValues: {
      id: randomUuid,
    },
    criteriaMode: "all",
  });

  const onSubmit: SubmitHandler<AddRelationFormProps> = useCallback(
    (values) => {
      setOpen(false);
      //addRelationToModel(values);
      const handleManyToMany = () => {
        setPlacementMode(true);
        const onMouseUp = (event: MouseEvent) => {
          const latestGhostPosition =
            useAppStore.getState().model.ghostPosition;
          setPlacementMode(false);
          window.removeEventListener("mouseup", onMouseUp, {
            capture: true,
          });

          addRelationToModel({
            ...values,
            position: {
              x: latestGhostPosition.x,
              y: latestGhostPosition.y,
            },
          });
        };
        window.addEventListener("mouseup", onMouseUp, {
          capture: true,
        });
      };

      if (values.type === "many-to-many") {
        handleManyToMany();
      } else {
        addRelationToModel(values);
      }
    },
    []
  );

  console.log(form.formState.errors);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="type">Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  className="grid grid-cols-3 gap-4"
                >
                  {relations.map(({ key, value }) => (
                    <FormItem key={key}>
                      <RadioGroupItem
                        id={key}
                        value={key}
                        className="peer sr-only"
                      />
                      <FormLabel
                        htmlFor={key}
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        {value}
                      </FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="fromEntityId"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="type">From entity:</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Select entity</SelectLabel>
                      {model.entities.map((entity, i) => {
                        const hasId = entity.data.attributes.find(
                          (attr) => attr.type === "identifier"
                        );
                        return (
                          <SelectItem
                            key={i}
                            value={entity.id}
                            disabled={!hasId}
                          >
                            {entity.data.name}{" "}
                            {hasId
                              ? ""
                              : "(no identifier attribute to create a relation)"}
                          </SelectItem>
                        );
                      })}
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
          name="toEntityId"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="type">To entity:</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Select entity</SelectLabel>
                      {model.entities.map((entity, i) => {
                        const hasId = entity.data.attributes.find(
                          (attr) => attr.type === "identifier"
                        );
                        return (
                          <SelectItem
                            key={i}
                            value={entity.id}
                            disabled={!hasId}
                          >
                            {entity.data.name}{" "}
                            {hasId
                              ? ""
                              : "(no identifier attribute to create a relation)"}
                          </SelectItem>
                        );
                      })}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Add relation</Button>
      </form>
    </Form>
  );
}
