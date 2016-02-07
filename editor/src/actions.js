import fetch from 'isomorphic-fetch';

const PAGE_SIZE = 4096;
const PAGE_BOUNDARY = 2048;

export const HEX_VIEW_ROW_SET = 'HEX_VIEW_ROW_SET';
export const HEX_CURSOR_POS_SET = 'HEX_CURSOR_POS_SET';

export const HEX_DATA_FETCH_START = 'HEX_DATA_FETCH_START';
export const HEX_DATA_FETCH_END = 'HEX_DATA_FETCH_END';

export const METADATA_FETCH_START = 'METADATA_FETCH_START';
export const METADATA_FETCH_END = 'METADATA_FETCH_END';

export function hexCursorPosSet(pos) {
    return (dispatch, getState) => {
        const state = getState();
        let new_pos = Math.max(
            0,
            pos
        );
        if (state.metadata.data !== null) {
            new_pos = Math.min(
                state.metadata.data.size - 1,
                new_pos
            );
        }
        if (new_pos !== state.hex.cursor_pos) {
            dispatch({
                type: HEX_CURSOR_POS_SET,
                pos: new_pos
            });
            const {row, bytes_per_row, rows_per_page} = state.hex.view;
            let new_pos_row = Math.floor(new_pos / bytes_per_row);
            if (new_pos_row < row) {
                dispatch(hexViewRowSet(new_pos_row));
            } else if (new_pos_row >= row + rows_per_page) {
                dispatch(hexViewRowSet(new_pos_row - rows_per_page + 1));
            }
        }
    };
}

export function hexViewRowSet(row) {
    return (dispatch, getState) => {
        const state = getState();
        let new_row = Math.max(
            0,
            row
        );
        if (state.metadata.data !== null) {
            new_row = Math.min(
                Math.floor((state.metadata.data.size - 1) / state.hex.view.bytes_per_row),
                new_row
            );
        }
        if (new_row !== state.hex.view.row) {
            dispatch({
                type: HEX_VIEW_ROW_SET,
                row: new_row
            });
        }
    };
}

function receiveHexData(start, end, data) {
    return {
        type: HEX_DATA_FETCH_END,
        start: start,
        end: start + PAGE_SIZE,
        data: data
    };
}

function fetchHexData(start) {
    return dispatch => {
        let end = start + PAGE_SIZE;
        dispatch({
            type: HEX_DATA_FETCH_START,
            start: start
        });
        return fetch(`data/${start}/${PAGE_SIZE}`)
            .then(req => req.arrayBuffer())
            .then(buf => dispatch(receiveHexData(start, end, buf)));
    }
}

function shouldFetchHexData(state) {
    const hex = state.hex;
    if (!hex.fetch.ongoing && hex.data === null) {
        return true;
    }
    const {row, bytes_per_row} = hex.view;
    let pos = row * bytes_per_row;
    let start = hex.fetch.ongoing ? hex.fetch.start : hex.data.start;
    return pos < start || pos >= start + PAGE_BOUNDARY;
}

export function fetchHexDataIfNeeded() {
    return (dispatch, getState) => {
        const state = getState();
        if (shouldFetchHexData(state)) {
            const {row, bytes_per_row} = state.hex.view;
            return dispatch(
                fetchHexData(
                    Math.floor(row * bytes_per_row / PAGE_BOUNDARY) * PAGE_BOUNDARY
                )
            );
        }
    };
}

function receiveMetadata(json) {
    return {
        type: METADATA_FETCH_END,
        data: json
    };
}

function fetchMetadata() {
    return dispatch => {
        dispatch({
            type: METADATA_FETCH_START
        });
        return fetch(`data/infos`)
            .then(req => req.json())
            .then(json => dispatch(receiveMetadata(json)));
    }
}

export function fetchMetadataIfNeeded() {
    return (dispatch, getState) => {
        const metadata = getState().metadata;
        if (!metadata.is_loading && metadata.data === null) {
            return dispatch(fetchMetadata())
        }
    };
}
