import { useMemo } from "react";
import { buildBinsByCount } from "./utils";
import { geopotentialRanges, meteoPalette, windRanges } from "./constants";
import { Text } from "@university-ecosystem/ui-kit";
import { PaletteWrapperStyled } from "./palette.style";

interface Props {
  variable: string;
  pressure: number;
}

export const ColorLegend: React.FC<Props> = ({ variable, pressure }) => {
  const { bins, colors, unit } = useMemo(() => {
    let bins: number[] = [];
    let unit = "";

    if (variable === "z") {
      bins = buildBinsByCount(
        geopotentialRanges[pressure][0],
        geopotentialRanges[pressure][1],
        meteoPalette.length,
      );
      unit = "м";
    }

    if (variable === "u") {
      bins = buildBinsByCount(
        windRanges[pressure][0],
        windRanges[pressure][1],
        meteoPalette.length,
      );
      unit = "м/с";
    }

    if (variable === "u10") {
      bins = buildBinsByCount(
        windRanges.surface[0],
        windRanges.surface[1],
        meteoPalette.length,
      );
      unit = "м/с";
    }

    const colors = meteoPalette;

    return { bins, colors, unit };
  }, [variable, pressure]);

  return (
    <PaletteWrapperStyled>
      {/* цветные блоки */}
      <div style={{ display: "flex", width: "90%" }}>
        {colors.map((c, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 16,
              background: c,
            }}
          />
        ))}
      </div>

      {/* подписи границ */}
      <div
        style={{
          display: "flex",
          width: "90%",
          justifyContent: "space-between",
          fontSize: 11,
        }}
      >
        {bins.map((b, i) => (
          <Text key={i} variant="body2" textAlign="center">
            {Math.round(b)}
          </Text>
        ))}
      </div>
      <Text variant="body2">{unit}</Text>
    </PaletteWrapperStyled>
  );
};
