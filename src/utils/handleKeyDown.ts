import { NumericalRange } from "../types/CellMatrix";
import { EMPTY_AREA, areAreasEqual, findMinimalSelectedArea, getCellArea } from "./cellUtils";
import { moveFocusDown, moveFocusInsideSelectedRange, moveFocusLeft, moveFocusRight, moveFocusUp } from "./focus";
import { ReactGridStore } from "./reactGridStore";
import { tryExpandingTowardsDirection } from "./tryExpandingTowardsDirection";

// ? Problem: The more complicated is the key-combination (the more keys are included), the higher-in-code it has to be.
// * By that I mean it has to be executed earlier.

export const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, store: ReactGridStore): ReactGridStore => {
  if (event.altKey || store.currentlyEditedCell.rowIndex !== -1 || store.currentlyEditedCell.colIndex !== -1)
    return store;

  // Check if there is focusedCell
  let focusedCell = store.getFocusedCell();
  if (!focusedCell) {
    const firstCell = store.getCellByIndexes(0, 0);
    if (!firstCell) return store;

    // If there is no focused cell, set it to the first cell in the grid.
    focusedCell = {
      rowIndex: 0,
      colIndex: 0,
      ...firstCell,
    };
  }
  // * SHIFT + CTRL/COMMAND (⌘) + ArrowUp / ArrowDown / ArrowLeft / ArrowRight
  if (event.shiftKey && (event.ctrlKey || event.metaKey)) {
    switch (event.key) {
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
          startRowIdx: Number(store.rows[0].id),
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
          startColIdx: Number(store.columns[0].id),
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

  // * CTRL/COMMAND (⌘) + A / Space Bar
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
            selectedArea: {
              startRowIdx: -1,
              endRowIdx: -1,
              startColIdx: -1,
              endColIdx: -1,
            },
          };
        }

        return {
          ...store,
          selectedArea: wholeGridArea,
        };
      }

      // Jump to the cell that is in the first row, but in the same column as the focused cell.
      case "ArrowUp": {
        event.preventDefault();
        if (!focusedCell) return store;
        return { ...store, focusedLocation: { ...store.focusedLocation, rowIndex: 0 } };
      }
      // Jump to the cell that is in the last row, but in the same column as the focused cell.
      case "ArrowDown": {
        event.preventDefault();
        if (!focusedCell) return store;
        return { ...store, focusedLocation: { ...store.focusedLocation, rowIndex: store.rows.length - 1 } };
      }
      // Jump to the cell that is in the first column, but in the same row as the focused cell.
      case "ArrowLeft": {
        event.preventDefault();
        if (!focusedCell) return store;
        return { ...store, focusedLocation: { ...store.focusedLocation, colIndex: 0 } };
      }
      // Jump to the cell that is in the last column, but in the same row as the focused cell.
      case "ArrowRight": {
        event.preventDefault();
        if (!focusedCell) return store;
        return { ...store, focusedLocation: { ...store.focusedLocation, colIndex: store.columns.length - 1 } };
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
          startRowIdx: Number(store.rows[0].id),
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

  // * SHIFT  + ArrowUp / ArrowDown / ArrowLeft / ArrowRight
  if (event.shiftKey) {
    switch (event.key) {
      // Manage selection by expanding/shrinking it towards the direction of the arrow key.
      case "ArrowUp":
        event.preventDefault();
        return tryExpandingTowardsDirection(store, focusedCell, "Up");
      case "ArrowDown":
        event.preventDefault();
        return tryExpandingTowardsDirection(store, focusedCell, "Down");
      case "ArrowLeft":
        event.preventDefault();
        return tryExpandingTowardsDirection(store, focusedCell, "Left");
      case "ArrowRight":
        event.preventDefault();
        return tryExpandingTowardsDirection(store, focusedCell, "Right");

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
          startColIdx: Number(store.columns[0].id),
          endColIdx: store.columns.length,
        });

        // Select all cells in obtained area, including spanned cells.
        return { ...store, selectedArea: { ...areaWithSpannedCells } };
      }
    }
  }

  // * Other key-downs (non-combinations)

  const isAnyAreaSelected = !areAreasEqual(store.selectedArea, EMPTY_AREA);
  if (isAnyAreaSelected) {
    switch (event.key) {
      // Changed focused cell in selected area.
      case "Tab": {
        event.preventDefault();

        if (event.shiftKey) return moveFocusInsideSelectedRange(store, focusedCell, "left"); // If shift is pressed, move focus to the left.
        else return moveFocusInsideSelectedRange(store, focusedCell, "right"); // Otherwise, move focus to the right.
      }
    }
  }

  switch (event.key) {
    // Move focus to next cell.
    case "Tab": {
      event.preventDefault();

      if (event.shiftKey) {
        return moveFocusLeft(store, focusedCell); // If shift is pressed, move focus to the left.
      } else {
        return moveFocusRight(store, focusedCell); // Otherwise, move focus to the right.
      }
    }
      
    // ! May create conflict with other Edit-mode.
    case "Enter": {
      event.preventDefault();

      if (event.shiftKey) {
        return moveFocusUp(store, focusedCell); // If shift is pressed, move focus up (row up).
      } else {
        return moveFocusDown(store, focusedCell); // Otherwise, move focus down (row down).
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
    case "Home":
      event.preventDefault();
      return {
        ...store,
        focusedLocation: {
          rowIndex: focusedCell.rowIndex,
          colIndex: 0,
        },
      };
    case "End":
      event.preventDefault();
      return {
        ...store,
        focusedLocation: {
          rowIndex: focusedCell.rowIndex,
          colIndex: store.columns.length - 1,
        },
      };

    // TODO: Implement PageUp and PageDown
    case "PageUp":
      event.preventDefault();
      return store;
    default:
      return store;
  }
};
