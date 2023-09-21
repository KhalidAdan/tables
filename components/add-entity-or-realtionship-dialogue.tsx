"use client";

import { useState } from "react";
import { AddEntityForm } from "./add-entity-form";
import { AddRelationForm } from "./add-relation-form";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Icons } from "./ui/icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export default function AddEntityOrRelation(
  { disabled } = { disabled: false }
) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-lg"
          onClick={() => setOpen(!open)}
          disabled={disabled}
        >
          <Icons.add />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Entity or Relation</DialogTitle>
        </DialogHeader>
        <div>
          <Tabs defaultValue="add-entity" className="">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="add-entity">Entity</TabsTrigger>
              <TabsTrigger value="add-relation">Relation</TabsTrigger>
            </TabsList>
            <TabsContent value="add-entity">
              <Card className="border-none">
                <CardContent className="px-0">
                  <AddEntityForm setOpen={setOpen} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="add-relation">
              <Card className="border-none">
                <CardContent className="space-y-2 px-0 pb-0">
                  <AddRelationForm setOpen={setOpen} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
