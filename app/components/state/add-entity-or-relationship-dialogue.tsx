import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Icons } from "@/components/ui/icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { AddEntityForm } from "./add-entity-form";
import { AddRelationForm } from "./add-relation-form";

export default function AddEntityOrRelation({
  disabled,
}: {
  disabled?: boolean;
}) {
  let [open, setOpen] = useState(false);
  let shouldDisable = disabled ?? false;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-lg"
          onClick={() => setOpen(!open)}
          disabled={shouldDisable}
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
