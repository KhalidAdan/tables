import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EntitySchema, EntityType } from "@/lib/schemas/tables-schema";
import useAppStore from "@/lib/store";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint } from "@conform-to/zod";
import { Form } from "@remix-run/react";
import { useCallback } from "react";
import { Label } from "../ui/label";

export function AddEntityForm({
  setOpen,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  let { addEntityToModel, setPlacementMode } = useAppStore();
  let randomUuid = crypto.randomUUID();
  // let form = useForm<EntityType>({
  //   resolver: zodResolver(EntitySchema),
  //   criteriaMode: "all",
  //   defaultValues: {
  //     id: randomUuid,
  //     data: {
  //       name: "",
  //       attributes: [],
  //     },
  //     type: "entity",
  //     position: {
  //       x: 0,
  //       y: 0,
  //     },
  //   },
  // });

  let [form, fields] = useForm({
    constraint: getZodConstraint(EntitySchema),
    defaultValue: {
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

  let onSubmit = useCallback((values: Omit<EntityType, "position">) => {
    setOpen(false);
    setPlacementMode(true);

    let onMouseUp = (event: MouseEvent) => {
      let latestGhostPosition = useAppStore.getState().model.ghostPosition;

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

  return (
    <Form
      navigate={false}
      fetcherKey="add-entity-form"
      {...getFormProps(form)}
      onSubmit={(e) => {
        // get formData from submit event
        let formData = new FormData(e.currentTarget);

        let values = Object.fromEntries(formData.entries());

        onSubmit({
          ...values,
          id: values.id as string,
          data: {
            name: values.data as string,
            attributes: [],
          },
          type: "entity",
        });
      }}
    >
      <input type="hidden" name="id" value={randomUuid} />
      <div className="space-y-1">
        <Label htmlFor={fields.data.name}>Name</Label>
        <Input
          {...getInputProps(fields.data, { type: "text", required: true })}
        />
        <p className="text-sm text-muted-foreground">
          This is the name of your database table under the hood.
        </p>
      </div>
      <Button type="submit" name="intent" value="add-entity">
        Add Entity
      </Button>
    </Form>
  );
}
