import React, { FC, PropsWithChildren, useEffect, useRef, useState } from "react";
import { HandlerFn } from "../types/Behavior";
import { useReactGridStore, useReactGridStoreApi } from "../utils/reactGridStore";
import { updateStoreWithApiAndEventHandler } from "../utils/updateStoreWithApiAndEventHandler";
import { StyledRangesCSS } from "../types/PublicModel";
import { getStyledRangesCSS } from "../utils/getStyledRangesCSS";

interface GridWrapperProps {
  reactGridId: string;
  style?: React.CSSProperties;
}

const GridWrapper: FC<PropsWithChildren<GridWrapperProps>> = ({ reactGridId, style, children }) => {
  const storeApi = useReactGridStoreApi(reactGridId);
  const currentBehavior = useReactGridStore(reactGridId, (store) => store.currentBehavior);

  const reactGridElement = useRef<HTMLDivElement>(null);
  const assignReactGridRef = useReactGridStore(reactGridId, (store) => store.assignReactGridRef);

  const getStyledRanges = useReactGridStore(reactGridId, (store) => store.getStyledRanges);
  const styledRanges = getStyledRanges();
  const [css, setCSS] = useState<StyledRangesCSS | []>([]);

  useEffect(() => {
    if (reactGridElement.current) assignReactGridRef(reactGridElement.current);
  }, [reactGridElement]);

  const withStoreApi = <TEvent extends React.SyntheticEvent<HTMLDivElement>>(
    event: TEvent,
    handler?: HandlerFn<TEvent>
  ) => updateStoreWithApiAndEventHandler(storeApi, event, handler);

  useEffect(() => {
    const styledRangesCSS = getStyledRangesCSS(storeApi.getState(), styledRanges);
    if (styledRangesCSS) {
      setCSS(styledRangesCSS);
    }
  }, [styledRanges]); // DO NOT USE ANYTHING RELATED TO STORE TO DEPENDENCY ARRAY!

  return (
    <div
      css={css}
      id={`ReactGrid-${reactGridId}`}
      className="ReactGrid"
      ref={reactGridElement}
      style={style}
      onPointerDown={(e) => withStoreApi(e, currentBehavior?.handlePointerDown)}
      onPointerEnter={(e) => withStoreApi(e, currentBehavior?.handlePointerEnter)}
      onPointerMove={(e) => withStoreApi(e, currentBehavior?.handlePointerMove)}
      onPointerLeave={(e) => withStoreApi(e, currentBehavior?.handlePointerLeave)}
      onPointerUp={(e) => withStoreApi(e, currentBehavior?.handlePointerUp)}
      onDoubleClick={(e) => withStoreApi(e, currentBehavior?.handleDoubleClick)}
      onKeyDown={(e) => withStoreApi(e, currentBehavior?.handleKeyDown)}
      onKeyUp={(e) => withStoreApi(e, currentBehavior?.handleKeyUp)}
      onCompositionStart={(e) => withStoreApi(e, currentBehavior?.handleCompositionStart)}
      onCompositionUpdate={(e) => withStoreApi(e, currentBehavior?.handleCompositionUpdate)}
      onCompositionEnd={(e) => withStoreApi(e, currentBehavior?.handleCompositionEnd)}
      onCut={(e) => withStoreApi(e, currentBehavior?.handleCut)}
      onCopy={(e) => withStoreApi(e, currentBehavior?.handleCopy)}
      onPaste={(e) => withStoreApi(e, currentBehavior?.handlePaste)}
      onContextMenu={(e) => withStoreApi(e, currentBehavior?.handleContextMenu)}
    >
      {children}
    </div>
  );
};

export default GridWrapper;
