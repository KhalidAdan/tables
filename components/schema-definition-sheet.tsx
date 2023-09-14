import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { Icons } from "./ui/icons";

const testSchema = `CREATE TABLE Students (
    student_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    enrollment_date DATE
);

CREATE TABLE Classes (
    class_id SERIAL PRIMARY KEY,
    class_name VARCHAR(50) NOT NULL,
    class_code VARCHAR(20) UNIQUE NOT NULL,
    credit_hours INTEGER NOT NULL
);

CREATE TABLE Registration (
    registration_id SERIAL PRIMARY KEY,
    student_id INT REFERENCES Students(student_id),
    class_id INT REFERENCES Classes(class_id),
    registration_date DATE,
    grade VARCHAR(2),
    CONSTRAINT unique_idx_student_user UNIQUE (student_id, class_id)
);
`;

export default function SchemaDefinitionSheet({
  sheetTrigger,
  target,
  schema,
}: {
  sheetTrigger: React.ReactNode;
  target: "postgres" | "mysql" | "prisma";
  schema: string;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>{sheetTrigger}</SheetTrigger>
      <SheetContent side="right" className="!max-w-xl">
        <SheetHeader>
          <SheetTitle className="capitalize flex justify-between">
            {target} Schema
          </SheetTitle>
        </SheetHeader>
        <div className="absolute right-8 top-16">
          <Button variant="ghost" size="icon">
            <Icons.copy size={16} />
          </Button>
        </div>
        <pre className="!max-w-2xl w-xl rounded-lg bg-secondary p-3 overflow-x-scroll h-full">
          <code>{schema}</code>
        </pre>
      </SheetContent>
    </Sheet>
  );
}
