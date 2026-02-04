import { useParams } from "react-router-dom";
import { PmcWrapperStyled } from "./selector.style";
import { usePmcData } from "./hooks/use-pmc-data";
import { useToggle } from "@shared/hooks/use-toggle";
import { Button, ModalWindow, Text } from "@university-ecosystem/ui-kit";
import { ParamForm } from "./form";
import { useParamForm } from "./hooks/use-param-form";

export const PmcData = () => {
  const { id = "" } = useParams();

  const { flag, toggleOn, toggleOff } = useToggle();

  const { options, handleCreateParam } = usePmcData(id, toggleOff);

  const paramForm = useParamForm({ onSubmit: handleCreateParam });

  if (!id) return null;

  return (
    <PmcWrapperStyled>
      <ModalWindow isOpen={flag} onClose={toggleOff}>
        <ModalWindow.Header title="Добавить параметр" onClose={toggleOff} />
        <ModalWindow.Content>
          <ParamForm {...paramForm} isLoading={false} />
        </ModalWindow.Content>
      </ModalWindow>
      <Text variant="body1" bold>
        Данные ПМЦ
      </Text>

      {options.map((item) => (
        <Text variant="body1">
          {item.name} : {item.value}
        </Text>
      ))}

      <Button variant="text" onClick={toggleOn}>
        Добавить
      </Button>
    </PmcWrapperStyled>
  );
};
