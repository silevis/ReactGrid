//
//  This is the public API for ReactGrid
//  PLEASE
//  ASK ARCHITECT BEFORE INTRODUCING ANY CHANGE
//  THANKS!

//  Michael Matejko

export type SelectionMode = 'row' | 'column' | 'range';

// ASK ARCHITECT BEFORE INTRODUCING ANY CHANGE!
export interface ReactGridProps {
    readonly columns: Column[];
    readonly rows: Row[];
    readonly customCellTemplates?: CellTemplates;
    readonly focusLocation?: CellLocation;
    readonly highlights?: Highlight[];
    readonly stickyTopRows?: number;
    readonly stickyBottomRows?: number;
    readonly stickyLeftColumns?: number;
    readonly stickyRightColumns?: number;
    readonly disableFillHandle?: boolean;
    readonly disableRangeSelection?: boolean;
    readonly enableRowSelection?: boolean;
    readonly enableColumnSelection?: boolean;
    readonly disableFloatingCellEditor?: boolean;

    readonly onCellsChanged?: (cellChanges: CellChange<Cell>[]) => boolean;
    readonly onFocusLocationChanged?: (location: CellLocation) => boolean;
    readonly onColumnResized?: (columnId: Id, width: number) => void;
    readonly canReorderRows?: (targetRowId: Id, rowIds: Id[], dropPosition: DropPosition) => boolean;
    readonly onRowsReordered?: (targetRowId: Id, rowIds: Id[], dropPosition: DropPosition) => void;
    readonly canReorderColumns?: (targetColumnId: Id, columnIds: Id[], dropPosition: DropPosition) => boolean;
    readonly onColumnsReordered?: (targetColumnId: Id, columnIds: Id[], dropPosition: DropPosition) => void;
    readonly onContextMenu?: (selectedRowIds: Id[], selectedColIds: Id[], selectionMode: SelectionMode, menuOptions: MenuOption[]) => MenuOption[];
}

// ASK ARCHITECT BEFORE INTRODUCING ANY CHANGE!
export interface CellTemplates {
    [key: string]: CellTemplate;
}

// ASK ARCHITECT BEFORE INTRODUCING ANY CHANGE!
export interface CellLocation {
    readonly rowId: Id;
    readonly columnId: Id;
    // TODO some another way?
    readonly color?: string;
}

export interface Highlight {
    readonly rowId: Id;
    readonly columnId: Id;
    readonly borderColor?: string;
    readonly className?: string;
}

// ASK ARCHITECT BEFORE INTRODUCING ANY CHANGE!
export interface CellChange<TCell extends Cell = Cell> {
    readonly rowId: Id;
    readonly columnId: Id;
    readonly initialCell: TCell;
    readonly newCell: TCell;
}

// ASK ARCHITECT BEFORE INTRODUCING ANY CHANGE!
// This interface is used for the communication between ReactGrid and a cell
export interface CellTemplate<TCell extends Cell = Cell> {
    // Validate and convert to compatible cell type
    getCompatibleCell(uncertainCell: Uncertain<TCell>): Compatible<TCell>
    // Returns true if the data in the cell is not replacable
    // Default: _ => true
    isFocusable?(cell: Compatible<TCell>): boolean;
    // Update cell based on new props
    // If not implemented, cell will be read-only
    update?(cell: Compatible<TCell>, cellToMerge: UncertainCompatible<TCell>): Compatible<TCell>;
    // The keyCode represents the key pressed on the keyboard, or 1 for a pointer event (double click).
    // Returns the cell data either affected by the event or not.
    // Default: cell => { cell, enableEditMode: false }
    handleKeyDown?(cell: Compatible<TCell>, keyCode: number, ctrl: boolean, shift: boolean, alt: boolean): { cell: Compatible<TCell>; enableEditMode: boolean };
    // Custom styles based on cell data applied to the cells div element
    // Default: _ => cell.style | {}
    getStyle?(cell: Compatible<TCell>, isInEditMode: boolean): CellStyle;
    //
    getClassName?(cell: Compatible<TCell>, isInEditMode: boolean): string;
    // Render the cell content
    render(cell: Compatible<TCell>, isInEditMode: boolean, onCellChanged: (cell: Compatible<TCell>, commit: boolean) => void): React.ReactNode;
}

export type Id = number | string;

export type DropPosition = 'before' | 'on' | 'after';

// ASK ARCHITECT BEFORE INTRODUCING ANY CHANGE!
export interface Column {
    readonly columnId: Id;
    // default: 150
    readonly width?: number;
    // default: false
    readonly reorderable?: boolean;
    // default: false
    readonly resizable?: boolean;
    //readonly canDrop?: (columnIds: Id[], position: DropPosition) => boolean;
    //readonly onDrop?: (columnIds: Id[], position: DropPosition) => void;
    // if onResize === undefined => not resizable
    //readonly onResize?: (newWidth: number) => void;
}

export interface CellStyle {
    readonly color?: string;
    readonly background?: string;
    readonly overflow?: string;
    readonly paddingLeft?: string;
    // TODO
    //readonly borderLeft
    //readonly borderRight
    //readonly borderTop
    //readonly borderBottom
}

// ASK ARCHITECT BEFORE INTRODUCING ANY CHANGE!
export interface Cell {
    type: string;
    style?: CellStyle;
    className?: string;
}

// ASK ARCHITECT BEFORE INTRODUCING ANY CHANGE!
export type Uncertain<TCell extends Cell> = Partial<TCell> & Cell;

// ASK ARCHITECT BEFORE INTRODUCING ANY CHANGE!
// Extended & excangable cell (compatible between different types)
export type Compatible<TCell extends Cell> = TCell & {
    text: string;
    value: number;
}

export type UncertainCompatible<TCell extends Cell> = Uncertain<TCell> & {
    text: string;
    value: number;
}

// ASK ARCHITECT BEFORE INTRODUCING ANY CHANGE!
export interface Row {
    readonly rowId: Id;
    readonly cells: Cell[];
    // default: 25
    readonly height?: number;
    // default: false
    readonly reorderable?: boolean;
    //readonly canDrop?: (rowIds: Id[], position: DropPosition) => boolean;
    //readonly onDrop?: (rowIds: Id[], position: DropPosition) => void;
};

// ASK ARCHITECT BEFORE INTRODUCING ANY CHANGE!
export interface MenuOption {
    id: string;
    label: string;
    handler: () => void;
}
