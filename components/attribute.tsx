import { AttributeType } from "@/schemas";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export const Attribute = ({ attribute }: { attribute: AttributeType }) => {
  return (
    <div className="space-y-1">
      <Label htmlFor={attribute.name}>{attribute.name}</Label>
      <Input placeholder={attribute.name} />
    </div>
  );
};
