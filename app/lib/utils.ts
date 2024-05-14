import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function produceRelationTypeLabel(type: RelationType["type"]) {
  switch (type) {
    case "one-to-one":
      return "1 : 1";
    case "one-to-many":
      return "1 : M";
    case "many-to-many":
      return "1 : M"; // this is a little disingenous, but because we visually represent many-to-many as two one-to-many relations, this makes the most sense in the app
    default:
      throw new Error("Invalid relation type");
  }
}
