import { createContext, memo, useContext } from "react";
import { Cell, CellContextType } from "../types/PublicModel";
import { StickyOffsets } from "../types/InternalModel";
import { useReactGridId } from "./ReactGridIdProvider";

interface CellContextProviderProps {
  rowIndex: number;
  colIndex: number;
  realRowIndex: number;
  realColumnIndex: number;
  cell: Cell;
  isFocused: boolean;
  rowSpan?: number;
  colSpan?: number;
  getCellOffset: (rowIdx: number, colIdx: number, rowSpan: number, colSpan: number) => React.CSSProperties;
  stickyOffsets?: StickyOffsets;
  cellStyles?: React.CSSProperties;
}

export const CellContext = createContext<CellContextType>({
  realRowIndex: -1,
  realColumnIndex: -1,
  isFocused: false,
  containerStyle: {},
});

export const useCellContext = () => {
  const ctx = useContext(CellContext);

  if (!ctx) {
    throw new Error("CellContext is unavailable! Did you use this hook outside of ReactGrid's PaneGridRenderer?");
  }

  return ctx;
};

export const CellContextProvider = memo(
  ({
    rowIndex,
    colIndex,
    realRowIndex,
    realColumnIndex,
    rowSpan,
    colSpan,
    getCellOffset = () => ({}),
    cell,
    isFocused,
  }: CellContextProviderProps) => {
    const storeId = useReactGridId();

    const { Template, props } = cell;

    const children = <Template {...props} />;

    return (
      <CellContext.Provider
        value={{
          realRowIndex,
          realColumnIndex,
          isFocused,
          containerStyle: {
            ...(rowSpan && {
              gridRowEnd: `span ${rowSpan}`,
            }),
            ...(colSpan && {
              gridColumnEnd: `span ${colSpan}`,
            }),
            ...getCellOffset?.(rowIndex, colIndex, rowSpan ?? 1, colSpan ?? 1),
            gridRowStart: realRowIndex + 1,
            gridColumnStart: realColumnIndex + 1,
            ...props.style,
          },
        }}
      >
        {children}
      </CellContext.Provider>
    );
  }
);
