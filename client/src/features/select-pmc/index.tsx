import type { PMC } from "@shared/api/models/pmc";
import { PmcService } from "@shared/api/services/pmc";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Input,
  ModalWindow,
  PageLayout,
  Table,
  Text,
  useToggle,
} from "@university-ecosystem/ui-kit";
import {
  ContentWrapperStyled,
  PageWrapperStyled,
  PaginationWrapperStyled,
} from "./pmc.style";
import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePmcForm } from "./hooks/use-pmc-form";
import { CreatePmcForm } from "./form";
import { useSearch } from "@shared/hooks/use-search";
import { usePagination } from "@shared/hooks/use-pagination";

export const SelectPmc = () => {
  const navigate = useNavigate();

  const { flag, toggleOn, toggleOff } = useToggle();
  const { search, handleSearch } = useSearch();
  const { page, pageSize, handleIncreasePage } = usePagination();

  const { data, refetch } = useQuery({
    queryKey: ["pmc-list", search, page, pageSize],
    queryFn: () =>
      PmcService.getList(page, pageSize, {
        filters: search
          ? [
              {
                condition: "contains",
                field: "name",
                value: search,
              },
            ]
          : [],
      }),
  });

  const { mutate } = useMutation({
    mutationFn: (name: string) => PmcService.create(name),
    onSuccess: async () => {
      await refetch();
      toggleOff();
    },
  });

  const handleRowClick = useCallback((row: PMC) => {
    navigate(
      `/map/${row.id}?date=${row.name.replace("ПМЦ ", "").split(" ")[0]}`,
    );
  }, []);

  const pmcForm = usePmcForm({
    onSubmit: (values) => {
      mutate(values.name);
    },
  });

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      const key = event.key;

      if (key === "ArrowRight" && !data?.isLastPage) {
        handleIncreasePage();
      }

      if (key === "ArrowLeft") {
        handleIncreasePage(-1);
      }
    },
    [handleIncreasePage, data],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <PageLayout>
      <PageWrapperStyled>
        <PageLayout.Header
          title="Список ПМЦ"
          actions={[{ children: "Добавить", onClick: toggleOn }]}
        >
          <>asdasd</>
        </PageLayout.Header>

        <PageLayout.Content>
          <ContentWrapperStyled>
            <Input
              placeholder="Поиск"
              onChange={(value) => handleSearch(String(value))}
            />
            <Table<PMC>
              data={data?.list ?? []}
              onRowClick={handleRowClick}
              columns={[
                {
                  accessor: "name",
                  title: "Название",
                  render: (row) => (
                    <Text variant="body1" bold>
                      {row}
                    </Text>
                  ),
                },
                {
                  accessor: "hasTracks",
                  title: "Наличие разметки",
                  render: (row) => (
                    <Text variant="body1">{row ? "Есть" : "Нет"}</Text>
                  ),
                },
              ]}
            />
            <PaginationWrapperStyled>
              {page !== 1 && (
                <Button
                  size="inherit"
                  onlyIcon
                  icon={<>{"<"}</>}
                  onClick={() => handleIncreasePage(-1)}
                />
              )}
              <Text variant="body1" bold>
                {page}
              </Text>
              {!data?.isLastPage && (
                <Button
                  size="inherit"
                  onlyIcon
                  icon={<>{">"}</>}
                  onClick={() => handleIncreasePage()}
                />
              )}
            </PaginationWrapperStyled>
          </ContentWrapperStyled>
        </PageLayout.Content>
      </PageWrapperStyled>

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
    </PageLayout>
  );
};
