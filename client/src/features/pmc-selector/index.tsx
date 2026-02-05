import { useQuery } from "@tanstack/react-query";
import { PmcWrapperStyled } from "./selector.style";
import { PmcService } from "@shared/api/services/pmc";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Text } from "@university-ecosystem/ui-kit";
import { useCallback, useEffect } from "react";

export const PmcSelector = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { id = "" } = useParams();

  const { data } = useQuery({
    queryKey: ["pmc-list"],
    queryFn: () => PmcService.getList(),
  });

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement, HTMLSelectElement>) => {
      navigate(event.target.value);
    },
    [navigate],
  );

  useEffect(() => {
    if (id && data) {
      const item = data.list.filter((val) => val.id === id)[0];

      if (item) {
        searchParams.set("date", item.name.replace("ПМЦ ", ""));
        setSearchParams(searchParams);
      }
    }
  }, [id, data, searchParams, setSearchParams]);

  return (
    <PmcWrapperStyled>
      <Text variant="h6">Выберите ПМЦ</Text>
      <select value={id} onChange={handleChange}>
        <option value="" id={""}>
          Выберите ПМЦ
        </option>
        {data?.list.map((item) => (
          <option key={item.id} value={item.id} id={item.name}>
            {item.name}
          </option>
        ))}
      </select>
    </PmcWrapperStyled>
  );
};
