import { CellsLookupCallbacks, NumericalRange } from "../types/PublicModel.ts";
import { getCellArea } from "./getCellArea.ts";
import { areAreasEqual } from "./areAreasEqual.ts";
import { findMinimalSelectedArea } from "./findMinimalSelectedArea.ts";
import { EMPTY_AREA } from "../types/InternalModel.ts";
import { moveFocusDown, moveFocusInsideSelectedRange, moveFocusLeft, moveFocusRight, moveFocusUp } from "./focus.ts";
import { resizeSelectionInDirection } from "./resizeSelectionInDirection.ts";
import { ReactGridStore } from "../types/ReactGridStore.ts";
import React from "react";
import { getNumberOfVisibleRows } from "./getNumberOfVisibleRows.ts";
import { getHiddenTargetFocusByIdx } from "./getHiddenTargetFocusByIdx.ts";
import { isInPaneRange } from "./isInPaneRange.ts";
import { isCellInRange } from "./isCellInRange.ts";
import { isPaneExists } from "./isPaneExists.ts";

type HandleKeyDownConfig = {
  moveHorizontallyOnEnter: boolean;
};

const CONFIG_DEFAULTS: HandleKeyDownConfig = {
  moveHorizontallyOnEnter: false,
} as const;

// ? Problem: The more complicated is the key-combination (the more keys are included), the higher-in-code it has to be.
// * By that I mean it has to be executed earlier.
export const handleKeyDown = (
  event: React.KeyboardEvent<HTMLDivElement>,
  store: ReactGridStore,
  config: HandleKeyDownConfig = CONFIG_DEFAULTS
): Partial<ReactGridStore> => {
  // Check if there is focusedCell
  let focusedCell = store.getFocusedCell();
  if (!focusedCell) {
    const firstCell = store.getCellByIndexes(0, 0);
    if (!firstCell) return store;

    // If there is no focused cell, set it to the first cell in the grid.
    focusedCell = {
      ...firstCell,
    };
  }

  const isAnyAreaSelected =
    !areAreasEqual(store.selectedArea, EMPTY_AREA) && isCellInRange(store, focusedCell, store.selectedArea);

  // * SHIFT + CTRL/COMMAND (⌘) + <Key>
  if (event.shiftKey && (event.ctrlKey || event.metaKey)) {
    switch (event.key) {
      case "Home": {
        event.preventDefault();

        const cellArea = getCellArea(store, focusedCell);

        return {
          ...store,
          selectedArea: {
            startRowIdx: 0,
            endRowIdx: cellArea.endRowIdx,
            startColIdx: cellArea.startColIdx,
            endColIdx: cellArea.endColIdx,
          },
        };
      }
      case "End": {
        event.preventDefault();

        const cellArea = getCellArea(store, focusedCell);

        return {
          ...store,
          selectedArea: {
            startRowIdx: cellArea.startRowIdx,
            endRowIdx: store.rows.length,
            startColIdx: cellArea.startColIdx,
            endColIdx: cellArea.endColIdx,
          },
        };
      }
      // Select all rows according to columns in currently selected area OR focused cell area.
      case "ArrowUp": {
        event.preventDefault();
        // Get currently selected area
        let area: NumericalRange = { ...store.selectedArea };

        // If there is no selected area, get focused cell area
        const isAnyAreaSelected = !areAreasEqual(area, EMPTY_AREA);
        if (!isAnyAreaSelected) {
          area = getCellArea(store, focusedCell);
        }

        // Get the area occupied by cells in the selected columns.
        // Expand the obtained area by the area of cells that are spanned-cells, in selected direction (up).
        const areaWithSpannedCells = findMinimalSelectedArea(store, {
          ...area,
          startRowIdx: 0,
        });

        // Select all cells in obtained area, including spanned cells.
        return { ...store, selectedArea: { ...areaWithSpannedCells } };
      }

      // Select all rows according to columns in currently selected area OR focused cell area.
      case "ArrowDown": {
        event.preventDefault();
        // Get currently selected area
        let area: NumericalRange = { ...store.selectedArea };

        // If there is no selected area, get focused cell area
        const isAnyAreaSelected = !areAreasEqual(area, EMPTY_AREA);
        if (!isAnyAreaSelected) {
          area = getCellArea(store, focusedCell);
        }

        // Get the area occupied by cells in the selected columns.
        // Expand the obtained area by the area of cells that are spanned-cells, in selected direction (down).
        const areaWithSpannedCells = findMinimalSelectedArea(store, {
          ...area,
          endRowIdx: store.rows.length,
        });

        // Select all cells in obtained area, including spanned cells.
        return { ...store, selectedArea: { ...areaWithSpannedCells } };
      }

      // Select all columns according to rows in currently selected area OR focused cell area.
      case "ArrowLeft": {
        event.preventDefault();
        // Get currently selected area
        let area: NumericalRange = { ...store.selectedArea };

        // If there is no selected area, get focused cell area
        const isAnyAreaSelected = !areAreasEqual(area, EMPTY_AREA);
        if (!isAnyAreaSelected) {
          area = getCellArea(store, focusedCell);
        }

        // Get the area occupied by cells in the selected rows.
        // Expand the obtained area by the area of cells that are spanned-cells, in selected direction (to left).
        const areaWithSpannedCells = findMinimalSelectedArea(store, {
          ...area,
          startColIdx: 0,
        });

        // Select all cells in obtained area, including spanned cells.
        return { ...store, selectedArea: { ...areaWithSpannedCells } };
      }

      // Select all columns according to rows in currently selected area OR focused cell area.
      case "ArrowRight": {
        event.preventDefault();
        // Get currently selected area
        let area: NumericalRange = { ...store.selectedArea };

        // If there is no selected area, get focused cell area
        const isAnyAreaSelected = !areAreasEqual(area, EMPTY_AREA);
        if (!isAnyAreaSelected) {
          area = getCellArea(store, focusedCell);
        }

        // Get the area occupied by cells in the selected rows.
        // Expand the obtained area by the area of cells that are spanned-cells, in selected direction (to right).
        const areaWithSpannedCells = findMinimalSelectedArea(store, {
          ...area,
          endColIdx: store.columns.length,
        });

        // Select all cells in obtained area, including spanned cells.
        return { ...store, selectedArea: { ...areaWithSpannedCells } };
      }

      default:
        return store;
    }
  }

  // * CTRL/COMMAND (⌘) + <Key>
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      // Select all cells in the grid.
      case "a": {
        event.preventDefault();

        const wholeGridArea: NumericalRange = {
          startRowIdx: 0,
          endRowIdx: store.rows.length,
          startColIdx: 0,
          endColIdx: store.columns.length,
        };
        // If the whole grid is already selected, deselect it.
        if (areAreasEqual(store.selectedArea, wholeGridArea)) {
          return {
            ...store,
            selectedArea: EMPTY_AREA,
          };
        }

        return {
          ...store,
          selectedArea: wholeGridArea,
        };
      }

      case "Home": {
        event.preventDefault();

        getHiddenTargetFocusByIdx(0, 0)?.focus({ preventScroll: true });

        return store;
      }

      case "End": {
        event.preventDefault();

        getHiddenTargetFocusByIdx(store.rows.length - 1, store.columns.length - 1)?.focus({ preventScroll: true });

        return store;
      }

      // Jump to the cell that is in the first row, but in the same column as the focused cell.
      case "ArrowUp": {
        event.preventDefault();
        if (!focusedCell) return store;

        getHiddenTargetFocusByIdx(0, store.focusedLocation.colIndex)?.focus({ preventScroll: true });

        return { selectedArea: EMPTY_AREA };
      }
      // Jump to the cell that is in the last row, but in the same column as the focused cell.
      case "ArrowDown": {
        event.preventDefault();
        if (!focusedCell) return store;

        getHiddenTargetFocusByIdx(store.rows.length - 1, store.focusedLocation.colIndex)?.focus({
          preventScroll: true,
        });

        return {
          selectedArea: EMPTY_AREA,
        };
      }
      // Jump to the cell that is in the first column, but in the same row as the focused cell.
      case "ArrowLeft": {
        event.preventDefault();
        if (!focusedCell) return store;

        getHiddenTargetFocusByIdx(store.focusedLocation.rowIndex, 0)?.focus({
          preventScroll: true,
        });

        return { selectedArea: EMPTY_AREA };
      }
      // Jump to the cell that is in the last column, but in the same row as the focused cell.
      case "ArrowRight": {
        event.preventDefault();
        if (!focusedCell) return store;

        getHiddenTargetFocusByIdx(store.focusedLocation.rowIndex, store.columns.length - 1)?.focus({
          preventScroll: true,
        });

        return {
          selectedArea: EMPTY_AREA,
        };
      }

      // Select all rows according to columns in currently selected area OR focused cell area.
      case " ": {
        event.preventDefault();
        // Get currently selected area
        let area: NumericalRange = { ...store.selectedArea };

        // If there is no selected area, get focused cell area
        const isAnyAreaSelected = !areAreasEqual(area, EMPTY_AREA);
        if (!isAnyAreaSelected) {
          area = getCellArea(store, focusedCell);
        }

        // Get the area occupied by cells in the selected columns.
        // Expand the obtained area by the area of cells that are spanned-cells.
        const areaWithSpannedCells = findMinimalSelectedArea(store, {
          ...area,
          startRowIdx: 0,
          endRowIdx: store.rows.length,
        });

        // Select all cells in obtained area, including spanned cells.
        return { ...store, selectedArea: { ...areaWithSpannedCells } };
      }

      // If nothing has changed, return the store as it is.
      default:
        return store;
    }
  }

  // * SHIFT + <Key>
  if (event.shiftKey) {
    switch (event.key) {
      // Manage selection by expanding/shrinking it towards the direction of the arrow key.
      case "ArrowUp":
        event.preventDefault();
        return resizeSelectionInDirection(store, focusedCell, "Up");
      case "ArrowDown":
        event.preventDefault();
        return resizeSelectionInDirection(store, focusedCell, "Down");
      case "ArrowLeft":
        event.preventDefault();
        return resizeSelectionInDirection(store, focusedCell, "Left");
      case "ArrowRight":
        event.preventDefault();
        return resizeSelectionInDirection(store, focusedCell, "Right");

      case "PageUp": {
        event.preventDefault();

        // Get currently selected area
        let currentSelectedArea: NumericalRange = { ...store.selectedArea };

        const numberOfVisibleRows: number = getNumberOfVisibleRows(store, focusedCell.colIndex);

        // If there is no selected area, get focused cell area
        const isAnyAreaSelected = !areAreasEqual(currentSelectedArea, EMPTY_AREA);

        if (!isAnyAreaSelected) {
          currentSelectedArea = getCellArea(store, focusedCell);
        }

        let newRowIdx = -1;

        let newSelectedAreaStartRowIdx = -1;

        if (currentSelectedArea.startRowIdx === 0) return store;

        newRowIdx = currentSelectedArea.startRowIdx - numberOfVisibleRows;

        if (newRowIdx < 0) {
          newRowIdx = 0;
        }

        if (isInPaneRange(store, currentSelectedArea, "Top")) {
          newSelectedAreaStartRowIdx = newRowIdx;
        } else if (isInPaneRange(store, currentSelectedArea, "Bottom")) {
          newSelectedAreaStartRowIdx =
            currentSelectedArea.startRowIdx === store.paneRanges.BottomCenter.startRowIdx
              ? newRowIdx
              : store.paneRanges.BottomCenter.startRowIdx;
        } else if (currentSelectedArea.startRowIdx === store.paneRanges.TopCenter.endRowIdx) {
          newSelectedAreaStartRowIdx = 0;
        } else if (currentSelectedArea.startRowIdx - numberOfVisibleRows <= store.paneRanges.TopCenter.endRowIdx) {
          newSelectedAreaStartRowIdx = store.paneRanges.TopCenter.endRowIdx;
        } else {
          newSelectedAreaStartRowIdx = currentSelectedArea.startRowIdx - numberOfVisibleRows;
        }

        const minimalSelectedArea = findMinimalSelectedArea(store, {
          ...currentSelectedArea,
          startRowIdx: newSelectedAreaStartRowIdx,
        });

        return {
          selectedArea: { ...minimalSelectedArea },
        };
      }

      case "PageDown": {
        event.preventDefault();

        // Get currently selected area
        let currentSelectedArea: NumericalRange = { ...store.selectedArea };

        const numberOfVisibleRows: number = getNumberOfVisibleRows(store, focusedCell.colIndex);

        // If there is no selected area, get focused cell area
        const isAnyAreaSelected = !areAreasEqual(currentSelectedArea, EMPTY_AREA);

        if (!isAnyAreaSelected) {
          currentSelectedArea = getCellArea(store, focusedCell);
        }

        let newRowIdx = -1;

        let newSelectedAreaEndRowIdx = -1;

        const lastGridRowIdx = store.rows.length;

        const lastRowCellSpan = store.getCellByIndexes(lastGridRowIdx - 1, focusedCell.colIndex)?.rowSpan;

        if (currentSelectedArea.endRowIdx === lastGridRowIdx) return store;

        newRowIdx = currentSelectedArea.endRowIdx + numberOfVisibleRows;

        if (currentSelectedArea.endRowIdx + numberOfVisibleRows > lastGridRowIdx) {
          newRowIdx = lastGridRowIdx - (lastRowCellSpan ? lastRowCellSpan - 1 : 0);
        }

        if (isInPaneRange(store, currentSelectedArea, "Top")) {
          newSelectedAreaEndRowIdx =
            currentSelectedArea.endRowIdx === store.paneRanges.TopCenter.endRowIdx
              ? newRowIdx
              : store.paneRanges.TopCenter.endRowIdx;
        } else if (isInPaneRange(store, currentSelectedArea, "Bottom")) {
          newSelectedAreaEndRowIdx = newRowIdx + 1;
        } else if (currentSelectedArea.endRowIdx === store.paneRanges.BottomCenter.startRowIdx) {
          newSelectedAreaEndRowIdx = lastGridRowIdx - (lastRowCellSpan ? lastRowCellSpan - 1 : 0);
        } else if (currentSelectedArea.endRowIdx + numberOfVisibleRows >= store.paneRanges.BottomCenter.startRowIdx) {
          newSelectedAreaEndRowIdx = store.paneRanges.BottomCenter.startRowIdx;
        } else {
          newSelectedAreaEndRowIdx = currentSelectedArea.endRowIdx + numberOfVisibleRows;
        }

        const minimalSelectedArea = findMinimalSelectedArea(store, {
          ...currentSelectedArea,
          endRowIdx: newSelectedAreaEndRowIdx,
        });

        return {
          selectedArea: { ...minimalSelectedArea },
        };
      }

      case "Home": {
        event.preventDefault();

        // Get currently selected area
        let currentSelectedArea: NumericalRange = { ...store.selectedArea };

        // If there is no selected area, get focused cell area
        const isAnyAreaSelected = !areAreasEqual(currentSelectedArea, EMPTY_AREA);

        if (!isAnyAreaSelected) {
          currentSelectedArea = getCellArea(store, focusedCell);
        }

        if (currentSelectedArea.startColIdx === 0) return store;

        const leftPaneExists = isPaneExists(store, "Left");

        let newSelectedAreaStartColIdx = -1;

        if (isInPaneRange(store, currentSelectedArea, "Left")) {
          newSelectedAreaStartColIdx = 0;
        }
        if (isInPaneRange(store, currentSelectedArea, "Right")) {
          if (currentSelectedArea.startColIdx === store.paneRanges.Right.startColIdx) {
            if (leftPaneExists) newSelectedAreaStartColIdx = store.paneRanges.Left.endColIdx;
            else newSelectedAreaStartColIdx = store.paneRanges.Right.startColIdx;
          }
        } else {
          if (currentSelectedArea.startColIdx === store.paneRanges.Left.endColIdx) {
            newSelectedAreaStartColIdx = 0;
          } else {
            newSelectedAreaStartColIdx = store.paneRanges.Left.endColIdx;
          }
        }

        const minimalSelectedArea = findMinimalSelectedArea(store, {
          ...currentSelectedArea,
          startColIdx: newSelectedAreaStartColIdx,
        });

        return {
          selectedArea: { ...minimalSelectedArea },
        };
      }

      case "End": {
        event.preventDefault();

        // Get currently selected area
        let currentSelectedArea: NumericalRange = { ...store.selectedArea };

        // If there is no selected area, get focused cell area
        const isAnyAreaSelected = !areAreasEqual(currentSelectedArea, EMPTY_AREA);

        if (!isAnyAreaSelected) {
          currentSelectedArea = getCellArea(store, focusedCell);
        }

        const lastColIdx = store.columns.length;

        if (currentSelectedArea.endColIdx === lastColIdx) return store;

        const rightPaneExists = isPaneExists(store, "Right");

        let newSelectedAreaEndColIdx = -1;

        if (isInPaneRange(store, currentSelectedArea, "Left")) {
          if (currentSelectedArea.endColIdx === store.paneRanges.Left.endColIdx) {
            if (rightPaneExists) newSelectedAreaEndColIdx = store.paneRanges.Right.startColIdx;
            else newSelectedAreaEndColIdx = lastColIdx;
          } else {
            newSelectedAreaEndColIdx = store.paneRanges.Left.endColIdx;
          }
        } else if (isInPaneRange(store, currentSelectedArea, "Right")) {
          newSelectedAreaEndColIdx = lastColIdx;
        } else {
          if (currentSelectedArea.endColIdx === store.paneRanges.Right.startColIdx) {
            if (rightPaneExists) newSelectedAreaEndColIdx = store.paneRanges.Right.endColIdx;
            else newSelectedAreaEndColIdx = lastColIdx;
          } else {
            newSelectedAreaEndColIdx = store.paneRanges.Right.startColIdx;
          }
        }
        const minimalSelectedArea = findMinimalSelectedArea(store, {
          ...currentSelectedArea,
          endColIdx: newSelectedAreaEndColIdx,
        });

        return {
          selectedArea: { ...minimalSelectedArea },
        };
      }

      // Select all columns according to rows in currently selected area OR focused cell area.
      // SPACE BAR
      case " ": {
        event.preventDefault();
        // Get currently selected area
        let area: NumericalRange = { ...store.selectedArea };

        // If there is no selected area, get focused cell area
        const isAnyAreaSelected = !areAreasEqual(area, EMPTY_AREA);
        if (!isAnyAreaSelected) {
          area = getCellArea(store, focusedCell);
        }

        // Get the area occupied by cells in the selected rows.
        // Expand the obtained area by the area of cells that are spanned-cells.
        const areaWithSpannedCells = findMinimalSelectedArea(store, {
          ...area,
          startColIdx: 0,
          endColIdx: store.columns.length,
        });

        // Select all cells in obtained area, including spanned cells.
        return { ...store, selectedArea: { ...areaWithSpannedCells } };
      }

      case "Enter": {
        event.preventDefault();

        if (config.moveHorizontallyOnEnter) {
          return moveFocusInsideSelectedRange(store, focusedCell, "left");
        } else {
          return moveFocusInsideSelectedRange(store, focusedCell, "up");
        }
      }
    }
  }

  // * Other key-downs (non-combinations)

  switch (event.key) {
    // Move focus to next cell.
    case "Escape": {
      getHiddenTargetFocusByIdx(focusedCell.rowIndex, focusedCell.colIndex)?.focus({
        preventScroll: true,
      });

      return store;
    }
    case "Backspace":
    case "Delete": {
      let range: NumericalRange = store.selectedArea;

      if (areAreasEqual(range, EMPTY_AREA)) {
        range = getCellArea(store, focusedCell);
      }

      const cellsLookupCallbacks: CellsLookupCallbacks[] = [];

      for (let rowIdx = range.startRowIdx; rowIdx < range.endRowIdx; rowIdx++) {
        for (let colIdx = range.startColIdx; colIdx < range.endColIdx; colIdx++) {
          const element = store.cellsLookup.get(`${rowIdx} ${colIdx}`);
          if (element) {
            cellsLookupCallbacks.push(element);
          }
        }
      }

      cellsLookupCallbacks.forEach((element) => element.onStringValueReceived(""));

      return store;
    }
    case "Tab": {
      event.preventDefault();

      if (event.shiftKey) {
        // If shift is pressed, move focus to the left...
        if (isAnyAreaSelected) {
          // ...inside selected range if any range is selected, or...
          return moveFocusInsideSelectedRange(store, focusedCell, "left");
        }

        // ...to the left if no range is selected.
        return moveFocusLeft(store, focusedCell);
      } else {
        // If shift is not pressed, move focus to the right...
        if (isAnyAreaSelected) {
          // ...inside selected range if any range is selected, or...
          return moveFocusInsideSelectedRange(store, focusedCell, "right");
        }

        // ...to the right if no range is selected.
        return moveFocusRight(store, focusedCell);
      }
    }

    // ! May create conflict with other Edit-mode.
    case "Enter": {
      event.preventDefault();

      const isCellInSelectedArea = isCellInRange(store, focusedCell, store.selectedArea);

      if (config.moveHorizontallyOnEnter) {
        if (isCellInSelectedArea) {
          return moveFocusInsideSelectedRange(store, focusedCell, "right");
        } else {
          return moveFocusRight(store, focusedCell);
        }
      } else if (isCellInSelectedArea) {
        return moveFocusInsideSelectedRange(store, focusedCell, "down");
      } else {
        return moveFocusDown(store, focusedCell);
      }
    }

    // Move focus to adjacent cell, according to the direction that arrow key points to.
    case "ArrowUp":
      event.preventDefault();
      return moveFocusUp(store, focusedCell);
    case "ArrowDown":
      event.preventDefault();
      return moveFocusDown(store, focusedCell);
    case "ArrowLeft":
      event.preventDefault();
      return moveFocusLeft(store, focusedCell);
    case "ArrowRight":
      event.preventDefault();
      return moveFocusRight(store, focusedCell);

    // Move focus to the first/last cell in the row.
    case "Home": {
      event.preventDefault();

      getHiddenTargetFocusByIdx(focusedCell.rowIndex, 0)?.focus({
        preventScroll: true,
      });

      return {
        // If any area is selected, remove it.
        selectedArea: EMPTY_AREA,
      };
    }
    case "End": {
      event.preventDefault();

      getHiddenTargetFocusByIdx(focusedCell.rowIndex, store.columns.length - 1)?.focus({
        preventScroll: true,
      });

      return {
        // If any area is selected, remove it.
        selectedArea: EMPTY_AREA,
      };
    }

    // TODO: Implement PageUp and PageDown
    case "PageUp":
      event.preventDefault();
      return store;
    default:
      return store;
  }
};
