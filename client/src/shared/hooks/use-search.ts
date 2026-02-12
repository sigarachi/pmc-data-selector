import { useCallback, useState } from "react";
import debounce from "lodash/debounce";

export const useSearch = () => {
  const [search, setSearch] = useState("");

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const debouncedSearch = debounce(handleSearch, 1000);

  return {
    search,
    handleSearch: debouncedSearch,
  };
};
