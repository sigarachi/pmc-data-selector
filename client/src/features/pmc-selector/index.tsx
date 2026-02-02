import { PmcWrapperStyled } from "./selector.style";

export const PmcSelector = () => {
  return (
    <PmcWrapperStyled>
      <select>
        <option value="">Выберите ПМЦ</option>
        <option>1</option>
        <option>2</option>
        <option>3</option>
        <option>4</option>
      </select>
    </PmcWrapperStyled>
  );
};
