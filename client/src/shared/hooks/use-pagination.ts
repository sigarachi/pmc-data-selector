import { useCallback, useState } from "react";

export const usePagination = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleIncreasePage = useCallback(
    (value: number = 1) => {
      if (page + value > 0) {
        setPage((prev) => prev + value);
      }
    },
    [page],
  );

  const handleIncreasePageSize = useCallback((value: number = 10) => {
    setPageSize((prev) => prev + value);
  }, []);

  return {
    page,
    pageSize,
    handleIncreasePage,
    handleIncreasePageSize,
  };
};
