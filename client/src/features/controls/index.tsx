import { PmcData } from "@features/pmc-data";
import { PmcSelector } from "@features/pmc-selector";
import { Timeline } from "@features/timeline";
import { useCallback, useState } from "react";

export const Controls = () => {
  const [selected, setSelected] = useState<string>();

  const handleSelect = useCallback((value: string) => {
    setSelected(value);
  }, []);

  return (
    <>
      <Timeline onSelect={handleSelect} selected={selected} />
      <PmcSelector />
      <PmcData />
    </>
  );
};
