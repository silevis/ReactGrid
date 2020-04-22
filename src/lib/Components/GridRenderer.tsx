import * as React from 'react';
import { GridRendererProps } from '../Model';
import { HiddenElement } from './HiddenElement';

export const GridRenderer: React.FunctionComponent<GridRendererProps> = props => {
    const { state, eventHandlers, children } = props;
    const cellMatrix = state.cellMatrix;
    return (
        <div
            className='reactgrid'
            data-cy="reactgrid"
            style={{
                position: 'relative',
                width: cellMatrix.width,
                height: cellMatrix.height
            }}
            ref={eventHandlers.reactgridRefHandler}
        >
            <div
                className="reactgrid-content"
                onKeyDown={eventHandlers.keyDownHandler}
                onKeyUp={eventHandlers.keyUpHandler}
                onPointerDown={eventHandlers.pointerDownHandler}
                onPasteCapture={eventHandlers.pasteCaptureHandler}
                onPaste={eventHandlers.pasteHandler}
                onCopy={eventHandlers.copyHandler}
                onCut={eventHandlers.cutHandler}
                data-cy="reactgrid-content"
                style={{
                    width: state.cellMatrix.width,
                    height: state.cellMatrix.height,
                }}
            >
                {children}
                <HiddenElement hiddenElementRefHandler={eventHandlers.hiddenElementRefHandler} state={state} />
            </div>
        </div>)
}