import { getTimeArray } from "@shared/utils/get-time-array";
import { useMemo } from "react";
import { TimelineWrapperStyled } from "./timeline.style";
import { Badge } from "@university-ecosystem/ui-kit";
import type { TimeLineProps } from "./interfaces";

export const Timeline: React.FC<TimeLineProps> = ({ onSelect, selected }) => {
  const timeLine = useMemo(() => getTimeArray(), []);

  return (
    <TimelineWrapperStyled>
      {timeLine.map((item) => (
        <Badge
          variant={item === selected ? "filled" : "outlined"}
          text={item}
          color="primary"
          onClick={() => onSelect(item)}
        />
      ))}
    </TimelineWrapperStyled>
  );
};
