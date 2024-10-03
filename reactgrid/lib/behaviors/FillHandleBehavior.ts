import isEqual from "lodash.isequal";
import { Behavior } from "../types/Behavior";
import { CellsLookup, CellsLookupCallbacks, NumericalRange } from "../types/PublicModel";
import { EMPTY_AREA } from "../types/InternalModel";
import { ReactGridStore } from "../types/ReactGridStore";
import { getCellArea } from "../utils/getCellArea";
import { getFillDirection } from "../utils/getFillDirection";
import { getFillSideLocation } from "../utils/getFillSideLocation";
import isDevEnvironment from "../utils/isDevEnvironment";
import { getCellIndexesFromPointerLocation } from "../utils/getCellIndexesFromPointerLocation";
import { scrollTowardsSticky } from "../utils/scrollTowardsSticky";
import { getPaneNameByCell } from "../utils/getPaneNameByCell";

const devEnvironment = isDevEnvironment();

export const FillHandleBehavior: Behavior = {
  id: "FillHandle",
  handlePointerDown: function (event, store) {
    devEnvironment && console.log("FHB/handlePointerDown");
    return store;
  },
  handlePointerMove: function (event, store) {
    devEnvironment && console.log("FHB/handlePointerMove");

    return handlePointerMove(store, event);
  },
  handlePointerUp: function (event, store) {
    devEnvironment && console.log("FHB/handlePointerUp");

    return handlePointerUp(store);
  },

  handlePointerDownTouch: function (event, store) {
    devEnvironment && console.log("FHB/handlePointerDownTouch");

    return store;
  },

  handlePointerMoveTouch: function (event, store) {
    devEnvironment && console.log("FHB/handlePointerMoveTouch");

    return handlePointerMove(store, event);
  },

  handlePointerUpTouch: function (event, store) {
    devEnvironment && console.log("FHB/handlePointerUpTouch");

    return handlePointerUp(store);
  },
};

const handlePointerMove = (store: ReactGridStore, event: React.PointerEvent<HTMLDivElement> | PointerEvent) => {
  const { clientX, clientY } = event;
  const currentPointerIdx = getCellIndexesFromPointerLocation(clientX, clientY);
  const currentDragOverCell = store.getCellByIndexes(currentPointerIdx.rowIndex, currentPointerIdx.colIndex);

  let PreviousPane;

  if (!isEqual(store.selectedArea, EMPTY_AREA)) {
    // Get the previous pane based on the last cell of the selected area (where the fill handle button is located)
    PreviousPane = getPaneNameByCell(
      store,
      store.getCellByIndexes(store.selectedArea.endRowIdx - 1, store.selectedArea.endColIdx - 1)
    );
  } else {
    // Get the previous pane based on the focused cell
    PreviousPane = getPaneNameByCell(store, store.getFocusedCell());
  }

  if (currentDragOverCell) {
    if (PreviousPane === "Center") {
      scrollTowardsSticky(store, currentDragOverCell, currentPointerIdx);
    }
    if (PreviousPane === "Left" || PreviousPane === "Right") {
      scrollTowardsSticky(store, currentDragOverCell, currentPointerIdx, false, true);
    }
    if (PreviousPane === "TopCenter" || PreviousPane === "BottomCenter") {
      scrollTowardsSticky(store, currentDragOverCell, currentPointerIdx, true);
    }
  }

  const fillDirection = getFillDirection(store, event);
  const focusedCell = store.getCellByIndexes(store.focusedLocation.rowIndex, store.focusedLocation.colIndex);

  const selectedArea = store.selectedArea;

  const isSelectedArea = store.selectedArea.startRowIdx !== -1;

  const focusedCellArea = focusedCell ? getCellArea(store, focusedCell) : EMPTY_AREA;

  if (!fillDirection || fillDirection.value === null) {
    return {
      fillHandleArea: EMPTY_AREA,
    };
  }

  switch (fillDirection?.direction) {
    case "up": {
      return {
        fillHandleArea: {
          startColIdx: isSelectedArea ? selectedArea.startColIdx : focusedCellArea.startColIdx,
          startRowIdx: fillDirection.value,
          endColIdx: isSelectedArea ? selectedArea.endColIdx : focusedCellArea.endColIdx,
          endRowIdx: isSelectedArea ? selectedArea.startRowIdx : focusedCellArea.startRowIdx,
        },
      };
    }
    case "right": {
      return {
        fillHandleArea: {
          startColIdx: isSelectedArea ? selectedArea.endColIdx : focusedCellArea.endColIdx,
          startRowIdx: isSelectedArea ? selectedArea.startRowIdx : focusedCellArea.startRowIdx,
          endColIdx: fillDirection.value + 1,
          endRowIdx: isSelectedArea ? selectedArea.endRowIdx : focusedCellArea.endRowIdx,
        },
      };
    }
    case "down": {
      return {
        fillHandleArea: {
          startColIdx: isSelectedArea ? selectedArea.startColIdx : focusedCellArea.startColIdx,
          startRowIdx: isSelectedArea ? selectedArea.endRowIdx : focusedCellArea.endRowIdx,
          endColIdx: isSelectedArea ? selectedArea.endColIdx : focusedCellArea.endColIdx,
          endRowIdx: fillDirection.value + 1,
        },
      };
    }
    case "left": {
      return {
        fillHandleArea: {
          startColIdx: fillDirection.value,
          startRowIdx: isSelectedArea ? selectedArea.startRowIdx : focusedCellArea.startRowIdx,
          endColIdx: isSelectedArea ? selectedArea.startColIdx : focusedCellArea.startColIdx,
          endRowIdx: isSelectedArea ? selectedArea.endRowIdx : focusedCellArea.endRowIdx,
        },
      };
    }
  }

  return store;
};

const handlePointerUp = (store: ReactGridStore) => {
  const fillSide = getFillSideLocation(store);

  const focusedCell = store.getCellByIndexes(store.focusedLocation.rowIndex, store.focusedLocation.colIndex);

  const previouslySelectedArea = store.selectedArea;

  const cellsLookup = store.cellsLookup;

  if (store.fillHandleArea.startRowIdx !== -1) {
    let selectedArea: NumericalRange;

    if (store.selectedArea.startRowIdx !== -1) {
      selectedArea = store.selectedArea;
    } else {
      selectedArea = focusedCell ? getCellArea(store, focusedCell) : EMPTY_AREA;
    }

    if (store.onFillHandle) {
      const preventDefaultFillHandleBehavior = store.onFillHandle(selectedArea, store.fillHandleArea, cellsLookup);

      if (!preventDefaultFillHandleBehavior) {
        defaultFillHandle(selectedArea, store.fillHandleArea, cellsLookup);
      }
    } else {
      defaultFillHandle(selectedArea, store.fillHandleArea, cellsLookup);
    }
  }

  const isPreviouslySelectedArea = previouslySelectedArea.startRowIdx !== -1;

  const newSelectedArea = store.fillHandleArea;

  if (isEqual(newSelectedArea, EMPTY_AREA)) {
    return {
      ...store,
      fillHandleArea: EMPTY_AREA,
      currentBehavior: store.getBehavior("Default"),
    };
  }

  if (fillSide === "bottom") {
    if (isPreviouslySelectedArea) {
      newSelectedArea.startRowIdx = store.selectedArea.startRowIdx;
    } else {
      newSelectedArea.startRowIdx = newSelectedArea.startRowIdx - ((focusedCell?.rowSpan ?? 1) || 1);
    }
  } else if (fillSide === "top") {
    if (isPreviouslySelectedArea) {
      newSelectedArea.endRowIdx = store.selectedArea.endRowIdx;
    } else {
      newSelectedArea.endRowIdx = newSelectedArea.endRowIdx + ((focusedCell?.rowSpan ?? 1) || 1);
    }
  } else if (fillSide === "right") {
    if (isPreviouslySelectedArea) {
      newSelectedArea.startColIdx = store.selectedArea.startColIdx;
    } else {
      newSelectedArea.startColIdx = newSelectedArea.startColIdx - ((focusedCell?.colSpan ?? 1) || 1);
    }
  } else if (fillSide === "left") {
    if (isPreviouslySelectedArea) {
      newSelectedArea.endColIdx = store.selectedArea.endColIdx;
    } else {
      newSelectedArea.endColIdx = newSelectedArea.endColIdx + ((focusedCell?.colSpan ?? 1) || 1);
    }
  }

  return {
    ...store,
    selectedArea: newSelectedArea,
    fillHandleArea: EMPTY_AREA,
    currentBehavior: store.getBehavior("Default"),
  };
};

const defaultFillHandle = (selectedArea: NumericalRange, fillRange: NumericalRange, cellsLookup: CellsLookup) => {
  // Check if the fill handle is being dragged upwards
  const isFillingUpwards = fillRange.startRowIdx < selectedArea.startRowIdx;
  // Calculate the number of rows and columns in the selected area
  const relativeRowSize = selectedArea.endRowIdx - selectedArea.startRowIdx;
  const relativeColSize = selectedArea.endColIdx - selectedArea.startColIdx;

  // Iterate over the rows and columns in the fill range
  for (let i = fillRange.startRowIdx; i < fillRange.endRowIdx; i++) {
    for (let j = fillRange.startColIdx; j < fillRange.endColIdx; j++) {
      const currentCellCallbacks = cellsLookup.get(`${i} ${j}`);

      if (!currentCellCallbacks) continue;

      // Skip cells of type 'header'
      if (i === 0) continue;

      // Calculate the relative row and column indices within the selected area
      const relativeRowIdx = isFillingUpwards
        ? (selectedArea.endRowIdx - i - 1) % relativeRowSize
        : (i - fillRange.startRowIdx) % relativeRowSize;
      const relativeColIdx = (j - fillRange.startColIdx) % relativeColSize;

      // Get the value from the cell in the selected area that corresponds to the relative row and column indices
      const sourceCellCallbacks = cellsLookup.get(
        `${selectedArea.startRowIdx + relativeRowIdx} ${selectedArea.startColIdx + relativeColIdx}`
      );

      //  If cell is a span member, skip it
      const isNotEmpty = (obj: CellsLookupCallbacks | undefined): obj is CellsLookupCallbacks =>
        !!obj && Object.keys(obj).length > 0;

      if (isNotEmpty(sourceCellCallbacks) && isNotEmpty(currentCellCallbacks)) {
        const newValue = sourceCellCallbacks.onStringValueRequsted();
        currentCellCallbacks.onStringValueReceived(newValue);
      }
    }
  }
};
