import { getTimeArray } from "@shared/utils/get-time-array";
import { useCallback, useMemo, useState } from "react";
import { TimelineWrapperStyled } from "./timeline.style";
import { Badge } from "@university-ecosystem/ui-kit";
import type { TimeLineProps } from "./interfaces";
import { useSearchParams } from "react-router-dom";

export const Timeline: React.FC<TimeLineProps> = () => {
  const timeLine = useMemo(() => getTimeArray(), []);

  const [selected, setSelected] = useState<string>();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSelect = useCallback(
    (value: string) => {
      setSelected(value);
      searchParams.set("time", value);
      setSearchParams(searchParams);
    },
    [searchParams, setSearchParams],
  );

  return (
    <TimelineWrapperStyled>
      {timeLine.map((item) => (
        <Badge
          variant={item === selected ? "filled" : "outlined"}
          text={item}
          color="primary"
          onClick={() => handleSelect(item)}
        />
      ))}
    </TimelineWrapperStyled>
  );
};
