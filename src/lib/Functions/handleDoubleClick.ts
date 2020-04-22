import { State, Location, PointerEvent } from '../Model';
import { areLocationsEqual } from './areLocationsEqual';
import { getCompatibleCellAndTemplate } from './getCompatibleCellAndTemplate';
import { isSelectionKey } from './isSelectionKey';

export function handleDoubleClick(event: PointerEvent, location: Location, state: State): State {
    if (areLocationsEqual(location, state.focusedLocation)) {
        const { cell, cellTemplate } = getCompatibleCellAndTemplate(state, location);
        //const cellTemplate = state.cellTemplates[location.cell.type];
        if (cellTemplate.handleKeyDown) {
            const { cell: newCell, enableEditMode } = cellTemplate.handleKeyDown(cell, 1, isSelectionKey(event), event.shiftKey, event.altKey);
            if (enableEditMode) {
                return { ...state, currentlyEditedCell: newCell };
            }
        }
    }
    return state;
}