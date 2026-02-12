import { getTimeArray } from "@shared/utils/get-time-array";
import { useCallback, useEffect, useMemo, useState } from "react";
import { TimelineWrapperStyled } from "./timeline.style";
import { Badge, Button } from "@university-ecosystem/ui-kit";
import type { TimeLineProps } from "./interfaces";
import { useSearchParams } from "react-router-dom";

export const Timeline: React.FC<TimeLineProps> = () => {
  const timeLine = useMemo(() => getTimeArray(), []);

  const [selected, setSelected] = useState<string>("");
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSelect = useCallback(
    (value: string) => {
      setSelected(value);
      searchParams.set("time", value);
      setSearchParams(searchParams);
    },
    [searchParams, setSearchParams],
  );

  const handleTimelineSelect = useCallback(
    (isRight: boolean) => {
      const index = timeLine.indexOf(selected);

      if (isRight) {
        if (index !== -1 && index + 1 < timeLine.length) {
          handleSelect(timeLine[index + 1]);
        } else if (index !== -1 && index + 1 >= timeLine.length) {
          handleSelect(timeLine[0]);
        }
      } else {
        if (index !== -1 && index - 1 >= 0) {
          handleSelect(timeLine[index - 1]);
        } else if (index !== -1 && index - 1 < 0) {
          handleSelect(timeLine[timeLine.length - 1]);
        }
      }
    },
    [selected, timeLine, handleSelect],
  );

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      const key = event.key;

      if (key === "ArrowRight") {
        handleTimelineSelect(true);
      }

      if (key === "ArrowLeft") {
        handleTimelineSelect(false);
      }
    },
    [handleTimelineSelect],
  );

  useEffect(() => {
    const searchTime = searchParams.get("time");
    if (searchTime) {
      setSelected(searchTime);
    }
  }, [searchParams]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <TimelineWrapperStyled>
      <Button
        size="inherit"
        onlyIcon
        icon={<>{"<"}</>}
        onClick={() => handleTimelineSelect(false)}
      />
      {timeLine.map((item) => (
        <Badge
          variant={item === selected ? "filled" : "outlined"}
          text={item}
          color="primary"
          onClick={() => handleSelect(item)}
        />
      ))}
      <Button
        size="inherit"
        onlyIcon
        icon={<>{">"}</>}
        onClick={() => handleTimelineSelect(true)}
      />
    </TimelineWrapperStyled>
  );
};
