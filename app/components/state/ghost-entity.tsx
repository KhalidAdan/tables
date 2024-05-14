import useAppStore from "@/lib/store";
import { useEffect, useRef, useState } from "react";
import { useReactFlow } from "reactflow";

export default function GhostEntity() {
  let ref = useRef<HTMLDivElement | null>(null);
  let [clientPosition, setClientPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  let {
    setGhostPosition,
    model: { ghostPosition },
  } = useAppStore();
  let reactFlowInstance = useReactFlow();

  useEffect(() => {
    let onMouseMove = (event: MouseEvent) => {
      let flowPosition = reactFlowInstance?.project({
        x: event.clientX,
        y: event.clientY,
      });
      setClientPosition({ x: event.clientX, y: event.clientY });
      setGhostPosition({
        x: flowPosition.x,
        y: flowPosition.y,
      });
    };

    document.addEventListener("mousemove", onMouseMove);

    return () => document.removeEventListener("mousemove", onMouseMove);
  }, []);

  return (
    <>
      {
        <div
          ref={ref}
          className="pt-6 px-6 pb-6 rounded-lg border w-96 text-left space-y-4 opacity-75 absolute top-0 left -0"
          style={
            clientPosition
              ? { top: clientPosition.y, left: clientPosition.x }
              : { display: "none" }
          }
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
