import * as React from 'react';
import { State, Borders, Location } from '../Model';
import { tryAppendChange } from '../Functions';
import { getCompatibleCellAndTemplate } from '../Functions/getCompatibleCellAndTemplate';

export interface CellRendererProps {
    state: State;
    location: Location;
    borders: Borders;
}

export const CellRenderer: React.FunctionComponent<CellRendererProps> = props => {
    const { state, location, children } = props;
    const { cell, cellTemplate } = getCompatibleCellAndTemplate(state, location);
    // const state = { ...props.state };
    // const location = props.location;
    const isFocused = state.focusedLocation !== undefined && (state.focusedLocation.column.idx === location.column.idx &&
        state.focusedLocation.row.idx === location.row.idx);
    const customClass = (cellTemplate.getClassName && cellTemplate.getClassName(cell, false)) ?? '';

    // TODO custom style
    const style: React.CSSProperties = {
        ...(cellTemplate.getStyle && (cellTemplate.getStyle(cell, false) || {})),
        ...cell.style,
        left: location.column.left,
        top: location.row.top,
        width: location.column.width,
        height: location.row.height,
        // TODO when to prevent scrolling?
        touchAction: (isFocused || cell.type === 'header') ? 'none' : 'auto' // prevent scrolling
    };

    return (
        <div className={`rg-cell rg-${cell.type}-cell ${customClass}`} style={style}
            data-cell-colidx={location.column.idx} data-cell-rowidx={location.row.idx} >
            {cellTemplate.render(cell, false, (cell, commit) => {
                if (!commit) throw new Error('commit should be set to true in this case.');
                state.update(state => tryAppendChange(state, location, cell));
            })}
            {children}
        </div >
    );
};
