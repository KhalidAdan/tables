import { MutableRefObject, useEffect } from "react";
import { checkIsIntersecting } from "../ui-store";

const PADDING_X = 24;
const PADDING_Y = 18;

export function useIsEntityIntersecting(
  ref: MutableRefObject<HTMLDivElement | null>,
  ghostPosition: { clientX: number; clientY: number } | null,
  clientEntities: {
    id: string;
    x: number;
    y: number;
  }[],
  setIntersecting: (isIntersecting: boolean) => void
) {
  useEffect(() => {
    if (!ref.current) return;
    // all entities have a constant width and height
    const { offsetWidth, offsetHeight } = ref.current;
    if (!ghostPosition) return;

    const ghost = {
      x: ghostPosition.clientX - PADDING_X,
      y: ghostPosition.clientY - PADDING_Y,
      w: offsetWidth,
      h: offsetHeight,
    };

    for (const entity of clientEntities) {
      if (
        checkIsIntersecting(ghost, {
          x: entity.x,
          y: entity.y,
          w: offsetWidth,
          h: offsetHeight,
        })
      ) {
        setIntersecting(true);
      } else {
        setIntersecting(false);
      }
    }
  }, [ghostPosition, clientEntities, setIntersecting]);
}
