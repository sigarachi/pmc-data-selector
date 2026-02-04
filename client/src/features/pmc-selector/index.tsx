import { useQuery } from "@tanstack/react-query";
import { PmcWrapperStyled } from "./selector.style";
import { PmcService } from "@shared/api/services/pmc";
import { useNavigate, useParams } from "react-router-dom";
import { Text } from "@university-ecosystem/ui-kit";

export const PmcSelector = () => {
  const navigate = useNavigate();
  const { id = "" } = useParams();

  const { data } = useQuery({
    queryKey: ["pmc-list"],
    queryFn: () => PmcService.getList(),
  });

  return (
    <PmcWrapperStyled>
      <Text variant="h6">Выберите ПМЦ</Text>
      <select value={id} onChange={(event) => navigate(event.target.value)}>
        <option value="">Выберите ПМЦ</option>
        {data?.list.map((item) => (
          <option value={item.id}>{item.name}</option>
        ))}
      </select>
    </PmcWrapperStyled>
  );
};
