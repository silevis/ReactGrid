import { GridColumn, GridRow, Location } from '.';

export type SliceDirection = 'columns' | 'rows' | 'both';

export interface IRange {
    readonly width: number;
    readonly height: number;
    readonly first: Location;
    readonly last: Location;

    contains: (location: Location) => boolean;
    slice: (range: Range, direction: SliceDirection) => Range;
}

export class Range implements IRange {
    readonly width: number;
    readonly height: number;
    readonly first: Location;
    readonly last: Location;

    // TODO add containsRange and intersectsWith in pro be extending this class
    constructor(public readonly rows: GridRow[], public readonly columns: GridColumn[]) {
        this.first = { row: this.rows[0], column: this.columns[0] };
        this.last = { row: this.rows[this.rows.length - 1], column: this.columns[this.columns.length - 1] };
        // TODO optimize
        this.height = this.rows.map(c => c.height).reduce((a, b) => a + b, 0);
        this.width = this.columns.map(c => c.width).reduce((a, b) => a + b, 0);
    }

    contains(location: Location): boolean {
        return location.column.idx >= this.first.column.idx &&
            location.column.idx <= this.last.column.idx &&
            location.row.idx >= this.first.row.idx &&
            location.row.idx <= this.last.row.idx;
    }

    slice(range: Range, direction: SliceDirection): Range {
        const firstRow = direction === 'rows' ? range.first.row : this.first.row;
        const firstColumn = direction === 'columns' ? range.first.column : this.first.column;
        const lastRow = direction === 'rows' ? range.last.row : this.last.row;
        const lastColumn = direction === 'columns' ? range.last.column : this.last.column;
        const slicedRows = this.rows.slice(firstRow.idx - this.first.row.idx, lastRow.idx - this.first.row.idx + 1);
        const slicedColumns = this.columns.slice(firstColumn.idx - this.first.column.idx, lastColumn.idx - this.first.column.idx + 1);
        return new Range(slicedRows, slicedColumns);
    }
}
