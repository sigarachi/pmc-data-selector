import { getTimeArray } from "@shared/utils/get-time-array";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LineWrapperStyled,
  TimelineWrapperStyled,
  TimeWrapperStyled,
} from "./timeline.style";
import { Badge, Button } from "@university-ecosystem/ui-kit";
import type { TimeLineProps } from "./interfaces";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ParamService } from "@shared/api/services/param";

export const Timeline: React.FC<TimeLineProps> = () => {
  const { id = "" } = useParams();

  const timeLine = useMemo(() => getTimeArray(), []);

  const [selected, setSelected] = useState<string>("");
  const [dateSelected, setDateSelected] = useState<string>("");
  const [searchParams, setSearchParams] = useSearchParams();

  const { data } = useQuery({
    queryKey: ["pmc-params", id],
    queryFn: () => ParamService.getList(id),
    enabled: Boolean(id.length),
  });

  const dateOptions = useMemo(() => {
    const dates =
      data?.params
        .filter((item) => item.name.includes("Дата"))
        .map((item) => item.value.split(" ")[0]) ?? [];

    const dateSet = new Set(dates);

    return Array.from(dateSet);
  }, [data]);

  const handleSelect = useCallback(
    (value: string) => {
      setSelected(value);
      searchParams.set("time", value);
      setSearchParams(searchParams);
    },
    [searchParams, setSearchParams],
  );

  const handleSelectDate = useCallback(
    (value: string) => {
      setDateSelected(value);
      searchParams.set("date", value.split(" ")[0]);
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
    const searchDate = searchParams.get("date");
    if (searchDate) {
      setDateSelected(searchDate);
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
      <TimeWrapperStyled>
        {dateOptions.map((item) => (
          <>
            <Badge
              variant={item === dateSelected ? "filled" : "outlined"}
              text={new Date(item).toLocaleDateString("ru-RU", {
                year: "2-digit",
                day: "2-digit",
                month: "2-digit",
              })}
              onClick={() => handleSelectDate(item)}
            />
          </>
        ))}
      </TimeWrapperStyled>
      <LineWrapperStyled>
        <Button
          size="inherit"
          onlyIcon
          icon={<>{"<"}</>}
          onClick={() => handleTimelineSelect(false)}
        />
        <TimeWrapperStyled>
          {timeLine.map((item) => (
            <Badge
              variant={item === selected ? "filled" : "outlined"}
              text={item}
              color="primary"
              onClick={() => handleSelect(item)}
            />
          ))}
        </TimeWrapperStyled>

        <Button
          size="inherit"
          onlyIcon
          icon={<>{">"}</>}
          onClick={() => handleTimelineSelect(true)}
        />
      </LineWrapperStyled>
    </TimelineWrapperStyled>
  );
};
