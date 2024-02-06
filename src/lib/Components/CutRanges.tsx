import * as React from "react";
import { PaneContentChild, Range } from "../../core";
import { PartialArea } from "./PartialArea";
import { isRangeIntersects } from "../Functions/isRangeIntersectsWith";

export const CutRanges: React.FC<PaneContentChild> = ({ state, calculatedRange }) => {
  console.log("calculatedRange", calculatedRange);
  console.log("state.selectedRanges", state.selectedRanges);
  return (
    <>
      {state.selectedRanges.map((range: Range, i: number) => {
        return (
          calculatedRange &&
          isRangeIntersects(calculatedRange, range) && (
            <PartialArea
              key={i}
              pane={calculatedRange}
              range={range}
              className="rg-partial-area-cut-range"
              style={{}}
            />
          )
        );
      })}
    </>
  );
};
