import { FocusedCell, IndexedLocation, PaneName, SpanMember } from "../types/InternalModel.ts";
import { Cell, CellsLookup, Column, NumericalRange, Row } from "../types/PublicModel.ts";
import isDevEnvironment from "../utils/isDevEnvironment.ts";
import { ReactGridStore } from "../types/ReactGridStore.ts";
import { useReactGridStoreApi } from "../utils/reactGridStore.ts";

const devEnvironment = isDevEnvironment();

/**
 * Interface for the ReactGrid API.
 */
export interface ReactGridAPI {
  setSelectedArea: (range: NumericalRange) => void;
  setFocusedCell: ({ rowIndex, colIndex }: IndexedLocation) => void;
  setSelectedColumns: (startColIdx: number, endColIdx: number) => void;
  setSelectedRows: (startRowIdx: number, endRowIdx: number) => void;
  getFocusedCell: () => FocusedCell | null;
  getCellByIndexes: (rowIndex: number, colIndex: number) => Cell | null;
  getCellOrSpanMemberByIndexes: (rowIndex: number, colIndex: number) => Cell | SpanMember | null;
  getPaneRanges: () => Record<PaneName, NumericalRange>;
  getCellsLookup: () => CellsLookup;
  getSelectedArea: () => NumericalRange | null;
  getColumns: () => Column[];
  getRows: () => Row[];
}

/**
 * Hook that provides access to the ReactGrid API.
 * @param id - The ID of the ReactGrid instance.
 * @returns An object containing setters and getters for interacting with the ReactGrid.
 */
export function useReactGridAPI(id: string): ReactGridAPI | undefined {
  return useReactGridStoreApi(id, (store: ReactGridStore) => {
    return {
      // Setters

      /**
       * Set the selected area in the ReactGrid.
       * @param range - The range to be selected.
       */
      setSelectedArea: (range: NumericalRange) => {
        return store.setSelectedArea(range);
      },

      /**
       * Set the focused cell in the ReactGrid.
       * @param location - The id-based location of the cell to be focused.
       */
      setFocusedCell: ({ rowIndex, colIndex }: IndexedLocation) => {
        const cell = store.getCellByIndexes(rowIndex, colIndex);

        if (devEnvironment && !cell) {
          console.warn(`Cell with rowIdx "${rowIndex}" and colIdx "${colIndex}" does not exist.`);
        }

        return store.setFocusedLocation(rowIndex, colIndex);
      },

      /**
       * Set the selected columns in the ReactGrid.
       * @param startColId
       * @param endColId
       */
      setSelectedColumns: (startColIdx: number, endColIdx: number) => {
        return store.setSelectedColumns(startColIdx, endColIdx);
      },

      /**
       * Set selected rows in the ReactGrid.
       * @param startRowId
       * @param endRowId
       */
      setSelectedRows: (startRowIdx: number, endRowIdx: number) => {
        return store.setSelectedRows(startRowIdx, endRowIdx);
      },

      // Getters

      /**
       * Get the currently focused cell in the ReactGrid.
       * @returns The location of the focused cell.
       */
      getFocusedCell: store.getFocusedCell,

      /**
       * Get the cell at the specified indexes in the ReactGrid.
       * @param rowIndex - The row index of the cell.
       * @param colIndex - The column index of the cell.
       * @returns The cell at the specified indexes.
       */
      getCellByIndexes: store.getCellByIndexes,

      /**
       * Get the cell or span member at the specified indexes in the ReactGrid.
       * @param rowIndex - The row index of the cell.
       * @param colIndex - The column index of the cell.
       * @returns The cell or span member at the specified indexes.
       */
      getCellOrSpanMemberByIndexes: store.getCellOrSpanMemberByIndexes,

      /**
       * Get the pane ranges in the ReactGrid.
       * @returns The pane ranges.
       */
      getPaneRanges: store.getPaneRanges,

      /**
       * Get the cells lookup in the ReactGrid.
       * @returns The cells lookup.
       */
      getCellsLookup: store.getCellsLookup,

      /**
       * Get the selected area in the ReactGrid.
       * @returns The selected area.
       */
      getSelectedArea: store.getSelectedArea,

      /**
       * Get the rows in the ReactGrid.
       * @returns Row[]
       */
      getRows: () => store.rows,

      /**
       * Get the columns in the ReactGrid.
       * @returns Column[]
       */
      getColumns: () => store.columns,
    };
  });
}
