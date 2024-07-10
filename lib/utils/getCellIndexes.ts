/**
 * Get the row and column index of a cell container element.
 * @param cellContainer The cell container element.
 * @returns The row and column index of the cell container element.
 */
export function getCellIndexesFromContainerElement(cellContainer: Element): {
  rowIndex: number;
  colIndex: number;
} {
  const rowIdxMatch = /rgRowIdx-(\d+)/.exec(cellContainer.classList.value);
  const colIdxMatch = /rgColIdx-(\d+)/.exec(cellContainer.classList.value);

  if (!rowIdxMatch || !colIdxMatch) return { rowIndex: -1, colIndex: -1 };

  const rowIndex = parseInt(rowIdxMatch[1]);
  const colIndex = parseInt(colIdxMatch[1]);

  return { rowIndex, colIndex };
}
