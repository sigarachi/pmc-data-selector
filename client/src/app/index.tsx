import { MyMap } from "@features/map";
import { PmcSelector } from "@features/pmc-selector";
import { Timeline } from "@features/timeline";
import { PageWrapperStyled } from "@shared/components/page-wrapper/page-wrapper.style";

function App() {
  return (
    <PageWrapperStyled>
      <MyMap />
      {/* <Timeline />
      <PmcSelector /> */}
    </PageWrapperStyled>
  );
}

export default App;
