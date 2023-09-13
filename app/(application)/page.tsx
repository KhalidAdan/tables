import { ModeToggle } from "@/components/ui/theme-toggle";

export default function HomePage() {
  return (
    <main className="h-full">
      <div className="absolute right-4 top-4">
        <ModeToggle />
      </div>
      <section className="w-full h-full bg-graph-image dark:bg-graph-image-dark bg-graph-size bg-graph-position"></section>
    </main>
  );
}
