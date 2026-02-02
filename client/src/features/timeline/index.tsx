import { getTimeArray } from "@shared/utils/get-time-array";
import { useMemo } from "react";
import { TimelineWrapperStyled } from "./timeline.style";

export const Timeline = () => {
  const timeLine = useMemo(() => getTimeArray(), []);

  return (
    <TimelineWrapperStyled>
      {timeLine.map((item) => (
        <p key={item}>{item}</p>
      ))}
    </TimelineWrapperStyled>
  );
};
