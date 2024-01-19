import { StyledRange } from "../types/PublicModel";

export function createStylesForRanges(styledRanges: StyledRange[]): {
  [selector: string]: React.CSSProperties;
}[] {
  const selectorsWithStyles = styledRanges.map((styledRange) => {
    const classNames: string[] = [];

    const { range, styles } = styledRange;

    for (let rowIndex = range.startRowIdx; rowIndex < range.endRowIdx; rowIndex++) {
      for (let colIndex = range.startColIdx; colIndex < range.endColIdx; colIndex++) {
        classNames.push(`.rgRowIdx-${rowIndex}.rgColIdx-${colIndex}`);
      }
    }

    const selector = classNames.join(", ");

    return { [`${selector}`]: styles };
  });

  return selectorsWithStyles;
}
