import { Behavior } from "../types/Behavior.ts";
import { NumericalRange } from "../types/PublicModel.ts";
import { getCellArea } from "../utils/getCellArea.ts";
import { getCellContainerFromPoint } from "../utils/getCellContainerFromPoint.ts";
import { getCellContainerLocation } from "../utils/getCellContainerLocation.ts";
import { handleKeyDown } from "../utils/handleKeyDown.ts";
import { isCellInRange } from "../utils/isCellInRange.ts";
import isDevEnvironment from "../utils/isDevEnvironment.ts";
import { getScrollableParent } from "../utils/scrollHelpers.ts";
import { ColumnReorderBehavior } from "./ColumnReorderBehavior.ts";
import { RowReorderBehavior } from "./RowReorderBehavior.ts";
import { handlePaneOverlap } from "../utils/handlePaneOverlap.ts";
import { getHiddenTargetFocusByIdx } from "../utils/getHiddenTargetFocusByIdx.ts";
import { EMPTY_AREA } from "../types/InternalModel.ts";
import { selectEntireColumn } from "../utils/selectEntireColumn.ts";
import { selectEntireRow } from "../utils/selectEntireRow.ts";
import { canReorder } from "../utils/canReorder.ts";
import { getHiddenFocusTargetLocation } from "../utils/getHiddenFocusTargetLocation.ts";
import { isReorderBehavior } from "../utils/isReorderBehavior.ts";
import { getCellIndexesFromPointerLocation } from "../utils/getCellIndexesFromPointerLocation.ts";
import { getCellContainerByIndexes } from "../utils/getCellContainerByIndexes.ts";
import { areAreasEqual } from "../utils/areAreasEqual.ts";

const devEnvironment = isDevEnvironment();

let isShiftPressed = false;

type DefaultBehaviorConfig = {
  moveHorizontallyOnEnter: boolean;
};

const CONFIG_DEFAULTS: DefaultBehaviorConfig = {
  moveHorizontallyOnEnter: false,
} as const;

export const DefaultBehavior = (config: DefaultBehaviorConfig = CONFIG_DEFAULTS): Behavior => ({
  id: "Default",
  handlePointerDown: function (event, store) {
    devEnvironment && console.log("DB/handlePointerDown");

    const cellContainer = getCellContainerFromPoint(event.clientX, event.clientY);
    if (!cellContainer) return store;

    const { rowIndex, colIndex } = getCellContainerLocation(cellContainer);

    const scrollableParent = (getScrollableParent(cellContainer, true) as Element) ?? store.reactGridRef;

    handlePaneOverlap(store, rowIndex, colIndex, scrollableParent);

    const focusingCell = store.getCellByIndexes(rowIndex, colIndex);
    if (!focusingCell) return store;

    const shouldSelectEntireColumn = rowIndex === 0 && store.enableColumnSelectionOnFirstRow;
    const shouldSelectEntireRow = colIndex === 0 && store.enableRowSelectionOnFirstColumn;

    let shouldChangeFocusLocation: boolean = true;

    if (shouldSelectEntireColumn) {
      if (store.selectedArea.endRowIdx === store.rows.length) {
        // Change focus only if clicked cell is outside the selected column ( & first row).
        shouldChangeFocusLocation = !isCellInRange(store, focusingCell, store.selectedArea);
      }
    } else if (shouldSelectEntireRow) {
      if (store.selectedArea.endColIdx === store.columns.length) {
        // Change focus only if clicked cell is outside the selected column ( & first col).
        shouldChangeFocusLocation = !isCellInRange(store, focusingCell, store.selectedArea);
      }
    }

    const cellArea = getCellArea(store, focusingCell);
    let newBehavior: Behavior = store.currentBehavior;
    let newSelectedArea: NumericalRange = EMPTY_AREA;

    if (shouldSelectEntireColumn) {
      if (canReorder(store, "column", focusingCell)) {
        newBehavior = ColumnReorderBehavior;
      }
      if (newBehavior.id !== ColumnReorderBehavior.id) {
        newSelectedArea = selectEntireColumn(store, cellArea);
      }
    } else if (shouldSelectEntireRow) {
      if (canReorder(store, "row", focusingCell)) {
        newBehavior = RowReorderBehavior;
      }
      if (newBehavior.id !== RowReorderBehavior.id) {
        newSelectedArea = selectEntireRow(store, cellArea);
      }
    }

    // If shift is pressed, extend the selection area.
    if (isShiftPressed) {
      const focusedCell = store.getFocusedCell();
      if (!focusedCell) return store;

      const focusedCellArea = getCellArea(store, focusedCell);
      const newSelectedArea = {
        startRowIdx: Math.min(focusedCellArea.startRowIdx, cellArea.startRowIdx),
        endRowIdx: Math.max(focusedCellArea.endRowIdx, cellArea.endRowIdx),
        startColIdx: Math.min(focusedCellArea.startColIdx, cellArea.startColIdx),
        endColIdx: Math.max(focusedCellArea.endColIdx, cellArea.endColIdx),
      };

      isShiftPressed = false;

      return { selectedArea: newSelectedArea };
    }

    if (shouldChangeFocusLocation) {
      if (focusingCell?.isFocusable !== false) {
        getHiddenTargetFocusByIdx(rowIndex, colIndex)?.focus({ preventScroll: true });
      }

      return {
        selectedArea: newSelectedArea,
        pointerStartIdx: { rowIndex, colIndex },
      };
    }

    if (isReorderBehavior(newBehavior.id)) {
      return {
        ...(newBehavior.id === RowReorderBehavior.id && { lineOrientation: "horizontal" }),
        currentBehavior: newBehavior,
        pointerStartIdx: { rowIndex, colIndex },
      };
    }

    return { pointerStartIdx: { rowIndex, colIndex } };
  },

  handleFocus: (event, store) => {
    devEnvironment && console.log("DB/handleFocus");

    const hiddenFocusTarget = document.activeElement;
    if (!hiddenFocusTarget) return store;

    const { rowIndex, colIndex } = getHiddenFocusTargetLocation(hiddenFocusTarget);
    if (rowIndex === -1 || colIndex === -1) return store;

    return {
      focusedLocation: { rowIndex, colIndex },
    };
  },

  handlePointerMove: (event, store) => {
    devEnvironment && console.log("DB/handlePointerMove");

    const cell = store.getCellByIndexes(store.pointerStartIdx.rowIndex, store.pointerStartIdx.colIndex);

    if (cell?.isSelectable === false) return store;

    return { currentBehavior: store.getBehavior("CellSelection") };
  },

  handlePointerUp: function (event, store) {
    return store;
  },

  handlePointerHold: function (event, store) {
    devEnvironment && console.log("DB/handlePointerHold");
    return store;
  },

  handlePointerHoldTouch: function (event, store) {
    devEnvironment && console.log("DB/handlePointerHoldTouch");
    return store;
  },

  handleKeyDown: function (event, store) {
    devEnvironment && console.log("DB/handleKeyDown");

    if (event.key === "Shift") isShiftPressed = true;

    return handleKeyDown(event, store, { moveHorizontallyOnEnter: config.moveHorizontallyOnEnter });
  },

  handleKeyUp: function (event, store) {
    devEnvironment && console.log("DB/handleKeyUp");

    if (event.key === "Shift") isShiftPressed = false;

    return store;
  },

  handlePointerDownTouch: function (event, store) {
    devEnvironment && console.log("DB/handlePointerDownTouch");

    const { rowIndex, colIndex } = getCellIndexesFromPointerLocation(event.clientX, event.clientY);

    const shouldSelectEntireColumn = rowIndex === 0 && store.enableColumnSelectionOnFirstRow;
    const shouldSelectEntireRow = colIndex === 0 && store.enableRowSelectionOnFirstColumn;

    const touchedCell = store.getCellByIndexes(rowIndex, colIndex);
    if (!touchedCell) return store;

    let newBehavior: Behavior = store.currentBehavior;
    const cellArea = getCellArea(store, touchedCell);
    let newSelectedArea: NumericalRange = EMPTY_AREA;

    let shouldChangeFocusLocation: boolean = true;

    if (shouldSelectEntireColumn) {
      if (store.selectedArea.endRowIdx === store.rows.length) {
        // Change focus only if clicked cell is outside the selected column ( & first row).
        shouldChangeFocusLocation = !isCellInRange(store, touchedCell, store.selectedArea);
      }
    } else if (shouldSelectEntireRow) {
      if (store.selectedArea.endColIdx === store.columns.length) {
        // Change focus only if clicked cell is outside the selected column ( & first col).
        shouldChangeFocusLocation = !isCellInRange(store, touchedCell, store.selectedArea);
      }
    }

    if (shouldSelectEntireColumn) {
      if (canReorder(store, "column", touchedCell)) {
        newBehavior = ColumnReorderBehavior;
      }
      if (newBehavior.id !== ColumnReorderBehavior.id) {
        newSelectedArea = selectEntireColumn(store, cellArea);
      }
    } else if (shouldSelectEntireRow) {
      if (canReorder(store, "row", touchedCell)) {
        newBehavior = RowReorderBehavior;
      }
      if (newBehavior.id !== RowReorderBehavior.id) {
        newSelectedArea = selectEntireRow(store, cellArea);
      }
    }

    if (shouldChangeFocusLocation) {
      if (shouldSelectEntireColumn || shouldSelectEntireRow) {
        if (touchedCell?.isFocusable !== false) {
          getHiddenTargetFocusByIdx(rowIndex, colIndex)?.focus({ preventScroll: true });
        }

        return {
          selectedArea: newSelectedArea,
          pointerStartIdx: { rowIndex, colIndex },
        };
      }
    }

    if (isReorderBehavior(newBehavior.id)) {
      return {
        ...(newBehavior.id === RowReorderBehavior.id && { lineOrientation: "horizontal" }),
        currentBehavior: newBehavior,
        pointerStartIdx: { rowIndex, colIndex },
      };
    }

    return { pointerStartIdx: { rowIndex, colIndex } };
  },

  handlePointerMoveTouch: function (event, store) {
    devEnvironment && console.log("DB/handlePointerMoveTouch");

    const shouldSelectEntireColumn = store.pointerStartIdx.rowIndex === 0 && store.enableColumnSelectionOnFirstRow;
    const shouldSelectEntireRow = store.pointerStartIdx.colIndex === 0 && store.enableRowSelectionOnFirstColumn;

    if (shouldSelectEntireColumn || shouldSelectEntireRow) {
      return { ...store, currentBehavior: store.getBehavior("CellSelection") };
    }

    const cell = store.getCellByIndexes(store.pointerStartIdx.rowIndex, store.pointerStartIdx.colIndex);

    if (
      store.pointerStartIdx.rowIndex !== store.focusedLocation.rowIndex ||
      store.pointerStartIdx.colIndex !== store.focusedLocation.colIndex ||
      cell?.isSelectable === false
    ) {
      return store;
    }

    return { ...store, currentBehavior: store.getBehavior("CellSelection") };
  },

  handlePointerUpTouch: function (event, store) {
    devEnvironment && console.log("DB/handlePointerUpTouch");

    const cellContainer = getCellContainerFromPoint(event.clientX, event.clientY);
    if (!cellContainer) return store;

    const { rowIndex, colIndex } = getCellContainerLocation(cellContainer);

    const focusedCell = store.getCellByIndexes(rowIndex, colIndex);

    const scrollableParent = (getScrollableParent(cellContainer, true) as Element) ?? store.reactGridRef!;

    handlePaneOverlap(store, rowIndex, colIndex, scrollableParent);

    const prevElement = getCellContainerByIndexes(store, store.pointerStartIdx);
    const currElement = getCellContainerByIndexes(store, { rowIndex, colIndex });

    if (prevElement && currElement) {
      const prevCell = getCellContainerLocation(prevElement);
      const currCell = getCellContainerLocation(currElement);

      const shouldSelectEntireRow = colIndex === 0 && store.enableRowSelectionOnFirstColumn;
      const shouldSelectEntireColumn = currCell.rowIndex === 0 && store.enableColumnSelectionOnFirstRow;

      if (prevCell.rowIndex === currCell.rowIndex && prevCell.colIndex === currCell.colIndex) {
        if (!shouldSelectEntireColumn && focusedCell?.isFocusable !== false) {
          getHiddenTargetFocusByIdx(rowIndex, colIndex)?.focus({ preventScroll: true });
        }

        if (!shouldSelectEntireColumn && !shouldSelectEntireRow) {
          return { selectedArea: EMPTY_AREA };
        }
      }
    }

    return store;
  },

  handleCopy: function (event, store) {
    devEnvironment && console.log("DB/handleCopy");

    event.preventDefault();

    const focusedCell = store.getCellByIndexes(store.focusedLocation.rowIndex, store.focusedLocation.colIndex);

    if (!focusedCell) return store;

    let cellsArea: NumericalRange;

    if (store.selectedArea.startRowIdx !== -1) {
      cellsArea = store.selectedArea;
    } else {
      cellsArea = getCellArea(store, focusedCell);
    }

    store.onCopy?.(event, cellsArea, store.cellsLookup);

    return store;
  },

  handleCut: function (event, store) {
    devEnvironment && console.log("DB/handleCut");

    event.preventDefault();

    const focusedCell = store.getCellByIndexes(store.focusedLocation.rowIndex, store.focusedLocation.colIndex);

    if (!focusedCell) return store;

    let cellsArea: NumericalRange;

    if (store.selectedArea.startRowIdx !== -1) {
      cellsArea = store.selectedArea;
    } else {
      cellsArea = getCellArea(store, focusedCell);
    }

    store.onCut?.(event, cellsArea, store.cellsLookup);

    return store;
  },

  handlePaste: function (event, store) {
    devEnvironment && console.log("DB/handlePaste");
    event.preventDefault();

    const focusedCell = store.getCellByIndexes(store.focusedLocation.rowIndex, store.focusedLocation.colIndex);
    if (!focusedCell) return store;

    let cellsArea: NumericalRange;

    // If there is a selected area, paste into that area
    if (!areAreasEqual(store.selectedArea, EMPTY_AREA)) {
      cellsArea = store.selectedArea;
      // If there is no selected area, paste into the focused cell
    } else {
      cellsArea = getCellArea(store, focusedCell);
    }

    if (store.onPaste) {
      store.onPaste?.(event, cellsArea, store.cellsLookup);
    } else {
      const html = event.clipboardData.getData("text/html");

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const rows = doc.querySelectorAll("tr");
      const firstRowCells = rows[0].querySelectorAll("td");

      let newSelectedArea;

      // If only one cell was pasted
      if (rows.length === 1 && firstRowCells.length === 1) {
        newSelectedArea = {
          startRowIdx: cellsArea.startRowIdx,
          endRowIdx: cellsArea.endRowIdx,
          startColIdx: cellsArea.startColIdx,
          endColIdx: cellsArea.startColIdx + rows[0].querySelectorAll("td").length,
        };
      }
      // If multiple cells were pasted
      else {
        const endRowIdx = Math.min(cellsArea.startRowIdx + rows.length, store.rows.length);
        const endColIdx = Math.min(cellsArea.startColIdx + rows[0].querySelectorAll("td").length, store.columns.length);

        newSelectedArea = {
          startRowIdx: cellsArea.startRowIdx,
          endRowIdx: endRowIdx,
          startColIdx: cellsArea.startColIdx,
          endColIdx: endColIdx,
        };
      }

      return { ...store, selectedArea: newSelectedArea };
    }

    return store;
  },
});
