import { useMutation, useQuery } from "@tanstack/react-query";
import { PmcWrapperStyled } from "./selector.style";
import { PmcService } from "@shared/api/services/pmc";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Button,
  ModalWindow,
  Text,
  useToggle,
} from "@university-ecosystem/ui-kit";
import { useCallback, useEffect } from "react";
import { CreatePmcForm } from "./form";
import { usePmcForm } from "./hooks/use-pmc-form";

export const PmcSelector = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { id = "" } = useParams();

  const { flag, toggleOn, toggleOff } = useToggle();

  const { data, refetch } = useQuery({
    queryKey: ["pmc-list"],
    queryFn: () => PmcService.getList(),
  });

  const { mutate } = useMutation({
    mutationFn: (name: string) => PmcService.create(name),
    onSuccess: async () => {
      await refetch();
      toggleOff();
    },
  });

  const pmcForm = usePmcForm({
    onSubmit: (values) => {
      mutate(values.name);
    },
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

      <ModalWindow isOpen={flag} onClose={toggleOff}>
        <ModalWindow.Header title="Добавить ПМЦ" onClose={toggleOff} />
        <ModalWindow.Content>
          <CreatePmcForm {...pmcForm} />
        </ModalWindow.Content>
        <ModalWindow.Footer
          actions={[
            {
              children: "Добавить",
              onClick: pmcForm.handleSubmitForm,
              size: "fullWidth",
            },
          ]}
        />
      </ModalWindow>
      <Button variant="text" onClick={toggleOn}>
        Добавить
      </Button>
    </PmcWrapperStyled>
  );
};
