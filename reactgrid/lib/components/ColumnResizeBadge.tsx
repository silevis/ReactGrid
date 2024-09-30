import { ResizeColumnBehavior } from "../behaviors/ResizeColumnBehavior";
import { useTheme } from "../hooks/useTheme";
import { useReactGridStore } from "../utils/reactGridStore";
import { useCellContext } from "./CellContext";
import { useReactGridId } from "./ReactGridIdProvider";

export const ColumnResizeBadge = () => {
  const theme = useTheme();
  const id = useReactGridId();
  const ctx = useCellContext();

  const resizingColIdx = useReactGridStore(id, (store) => store.resizingColIdx);
  const columns = useReactGridStore(id, (store) => store.columns);
  const shadowSize = useReactGridStore(id, (store) => store.shadowSize);

  const onResizeColumn = useReactGridStore(id, (store) => store.onResizeColumn);
  const setCurrentBehavior = useReactGridStore(id, (store) => store.setCurrentBehavior);
  const setResizingColIdx = useReactGridStore(id, (store) => store.setResizingColIdx);

  const cellColumn = columns[ctx.realColumnIndex];

  const shouldEnableColumnResize =
    resizingColIdx === undefined && onResizeColumn && cellColumn?.resizable && !shadowSize;

  return (
    shouldEnableColumnResize && (
      <div
        className="rg-resize-column"
        onPointerDown={() => {
          setResizingColIdx(ctx.realColumnIndex);
          setCurrentBehavior(ResizeColumnBehavior);
        }}
        css={{
          cursor: "col-resize",
          ...theme.resizeColumn.default,
          "&:hover": {
            ...theme.resizeColumn.hover,
          },
        }}
      />
    )
  );
};
