import { Button } from "@/components/ui/button";

import {
  AddRelationFormProps,
  AddRelationFormSchema,
  relations,
} from "@/lib/schemas/tables-schema";
import useAppStore from "@/lib/store";
import {
  getCollectionProps,
  getFormProps,
  getSelectProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint } from "@conform-to/zod";
import { Form } from "@remix-run/react";
import { useCallback } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export function AddRelationForm({
  setOpen,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  let { model, addRelationToModel, setPlacementMode } = useAppStore();
  let randomUuid = crypto.randomUUID();
  let relationKeys = relations.map(({ key }) => key);

  let [form, fields] = useForm({
    constraint: getZodConstraint(AddRelationFormSchema),
    defaultValue: {
      type: "one-to-many",
      id: randomUuid,
      fromEntityId: undefined,
      toEntityId: undefined,
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  });

  let onSubmit = useCallback(
    (values: AddRelationFormProps) => {
      setOpen(false);

      let handleManyToMany = () => {
        setPlacementMode(true);
        let onMouseUp = () => {
          let latestGhostPosition = useAppStore.getState().model.ghostPosition;
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
    [addRelationToModel, setOpen, setPlacementMode]
  );

  return (
    <Form
      navigate={false}
      fetcherKey="add-relation-form"
      {...getFormProps(form)}
      onSubmit={(e) => {
        let formData = new FormData(e.currentTarget);

        let values = Object.fromEntries(formData.entries());

        if (!values.fromEntityId || !values.toEntityId || !values.type) {
          alert("type, from entity and to entity are required");
          return;
        }

        onSubmit({
          id: values.id,
          type: values.type,
          fromEntityId: values.fromEntityId,
          toEntityId: values.toEntityId,
          onUpdate: values.onUpdate,
          onDelete: values.onDelete,
        } as unknown as AddRelationFormProps);
      }}
      className="space-y-4 mt-4"
    >
      <Input type="hidden" name="id" value={randomUuid} />
      <fieldset className="grid grid-cols-3 gap-4">
        {getCollectionProps(fields.type, {
          type: "radio",
          options: relationKeys,
        }).map(({ key, value }) => {
          return (
            <div key={key}>
              <input
                type="radio"
                id={key}
                value={key}
                name="type"
                className="peer sr-only"
              />
              <Label
                htmlFor={key}
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-checked:border-primary"
              >
                {relations.find(({ key }) => key === value)?.value}
              </Label>
            </div>
          );
        })}
      </fieldset>

      <div className="space-y-1">
        <Label htmlFor="fromEntityId">From entity:</Label>
        <select
          {...getSelectProps(fields.fromEntityId)}
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
        >
          <option value="">Select entity</option>
          {model.entities.map((entity, i) => {
            let hasId = entity.data.attributes.find(
              (attr) => attr.type === "identifier"
            );
            return (
              <option key={i} value={entity.id} disabled={!hasId}>
                {entity.data.name}{" "}
                {hasId ? "" : "(no identifier attribute to create a relation)"}
              </option>
            );
          })}
        </select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="toEntityId">To entity:</Label>
        <select
          {...getSelectProps(fields.toEntityId)}
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
        >
          <option value="">Select entity</option>
          {model.entities.map((entity, i) => {
            let hasId = entity.data.attributes.find(
              (attr) => attr.type === "identifier"
            );
            return (
              <option key={i} value={entity.id} disabled={!hasId}>
                {entity.data.name}{" "}
                {hasId ? "" : "(no identifier attribute to create a relation)"}
              </option>
            );
          })}
        </select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="onUpdate">On Update Rule</Label>
        <select
          {...getSelectProps(fields.onUpdate)}
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
        >
          <option value="">Select rule</option>
          <option value="CASCADE">Cascade</option>
          <option value="RESTRICT">Restrict</option>
          <option value="NO ACTION">No Action</option>
          <option value="SET NULL">Set Null</option>
          <option value="SET DEFAULT">Set Default</option>
        </select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="onDelete">On Delete Rule</Label>
        <select
          {...getSelectProps(fields.onDelete)}
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
        >
          <option value="">Select rule</option>
          <option value="CASCADE">Cascade</option>
          <option value="RESTRICT">Restrict</option>
          <option value="NO ACTION">No Action</option>
          <option value="SET NULL">Set Null</option>
          <option value="SET DEFAULT">Set Default</option>
        </select>
      </div>

      <Button type="submit" name="intent" value="add-relation">
        Add relation
      </Button>
    </Form>
  );
}
