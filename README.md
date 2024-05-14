# tables

Generates tables, pretty simple!

I cut my teeth on a more server-rendered project called Simbi, but with Tables, I wanted to dive deep into the client-focused capabilities of Next13. The result? A streamlined GUI that acts as a friendly generator around raw SQL, letting you visualize and construct your data models without the tedium.

## Features

- Drag-and-Drop Table Creation: Sketch your data model like you're doodling, but this doodle writes SQL schema for you.
- Column Customization: Add columns and set their data types effortlessly, from strings and numbers to more complex types like JSON and timestamp.
- Default Values: Specify default values for your columns. Whether it's a simple string or something dynamic like NOW() for timestamps, you've got full control.
- Unique Constraints: Ensure data integrity by setting unique constraints on columns, making sure you never have duplicate data where you don't want it.
- Nullable Columns: Choose whether a column should allow null values, giving you more flexibility in how you structure your data.
- Foreign Key Management: Easily create foreign keys to establish relations between tables, streamlining your database design process.
- Relations Simplified: Create one-to-one (1:1), one-to-many (1:N), and many-to-many (N:N) relations with a couple of clicks.
- SQL Export: Export your entire schema to raw SQL code. Choose your preferred database flavor: SQLite, MySQL, or Postgres.

## Check it out for yourself

![Watch](https://github.com/KhalidAdan/tables/assets/video.mov)

### Most interesting bits

- SQL export strategies in the services/
- zustand store in lib/
- zod schemas in schemas/
- shadcn/ui components in components/ui/
- reactflow setup/custom nodes and edges in app/page.tsx

### Whats next?

- I'm pretty happy with this, but if I did make any changes it would be to add check constraints and maybe more export strategies like prisma. Ater that maybe even a Next.js CLI wrapper that inits a project with next-auth with a custom adapter, shadcn/ui, a DB query runner that produces typed results, and some pregenerated api routes based on a schema. The UX escapes me at the moment but having a tool that generates a batteries included way to hack on side projects is pretty tempting!
