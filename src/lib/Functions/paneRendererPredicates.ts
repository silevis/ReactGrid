import { State } from '../Model';

export function shouldRenderTopSticky(state: State): boolean {
    return state.cellMatrix.stickyTopRange.height > 0;
}

export function shouldRenderLeftSticky(state: State): boolean {
    return state.cellMatrix.stickyLeftRange.width > 0;
}

export function shouldRenderCenterRange(state: State): boolean {
    return !!(state.visibleRange && state.visibleRange.width > 0); // TODO rewrite without !!
}

export function shouldRenderMiddleRange(state: State): boolean {

    return !!(state.cellMatrix.scrollableRange.height > 0 && state.cellMatrix.scrollableRange.first.column &&
        state.cellMatrix.scrollableRange.first.row && state.cellMatrix.scrollableRange.last.row &&
        state.visibleRange && state.visibleRange.height > 0); // TODO rewrite without !!
}