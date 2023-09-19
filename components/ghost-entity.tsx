"use client";

import { useRef } from "react";

export default function GhostEntity() {
  const ref = useRef<HTMLDivElement | null>(null);

  return (
    <>
      {
        <div
          ref={ref}
          className="pt-6 px-6 pb-6 rounded-lg border w-96 text-left space-y-4 opacity-75 absolute top-0 left -0"
        >
          <section className="-mx-6 -mt-6 w-96 border-b bg-accent rounded-t-lg pt-2 pl-6 pr-1 flex justify-between items-center opacity-50">
            <div>New entity</div>
          </section>
          <p>Place your entity to start editing it&apos;s attributes!</p>
        </div>
      }
    </>
  );
}
