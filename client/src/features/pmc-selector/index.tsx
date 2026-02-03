import { useQuery } from "@tanstack/react-query";
import { PmcWrapperStyled } from "./selector.style";
import { PmcService } from "@shared/api/services/pmc";
import { useNavigate } from "react-router-dom";
import { Typography } from "@university-ecosystem/ui-kit";

export const PmcSelector = () => {
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ["pmc-list"],
    queryFn: () => PmcService.getList(),
  });

  return (
    <PmcWrapperStyled>
      <Typography variant="h6">Выберите ПМЦ</Typography>
      <select onChange={(event) => navigate(event.target.value)}>
        <option value="">Выберите ПМЦ</option>
        {data?.list.map((item) => (
          <option value={item.id}>{item.name}</option>
        ))}
      </select>
    </PmcWrapperStyled>
  );
};
