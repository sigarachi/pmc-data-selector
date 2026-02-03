import { useState } from "react";

export interface ToggleReturn {
  flag: boolean;
  toggle: () => void;
  toggleOff: () => void;
  toggleOn: () => void;
}

export const useToggle = (initialToggleState?: boolean): ToggleReturn => {
  const [flag, setFlag] = useState<boolean>(initialToggleState ?? false);

  const toggle = () => {
    setFlag((prev) => !prev);
  };

  const toggleOff = () => {
    setFlag(false);
  };

  const toggleOn = () => {
    setFlag(true);
  };

  return {
    flag,
    toggle,
    toggleOff,
    toggleOn,
  };
};
