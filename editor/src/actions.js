import fetch from 'isomorphic-fetch';

const PAGE_SIZE = 4096;
const PAGE_BOUNDARY = 2048;

export const HEX_VIEW_ROW_SET = 'HEX_VIEW_ROW_SET';
export const HEX_MARKED_SET = 'HEX_MARKED_SET';
export const HEX_CURSOR_SET = 'HEX_CURSOR_SET';

export const HEX_DATA_FETCH_START = 'HEX_DATA_FETCH_START';
export const HEX_DATA_FETCH_END = 'HEX_DATA_FETCH_END';

export const METADATA_FETCH_START = 'METADATA_FETCH_START';
export const METADATA_FETCH_END = 'METADATA_FETCH_END';

export const TRACE_SET_ACTIVE = 'TRACE_SET_ACTIVE';

export const TRACE_FETCH_START = 'TRACE_FETCH_START';
export const TRACE_FETCH_END = 'TRACE_FETCH_END';

export function hex_cursor_set(pos) {
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
        if (new_pos !== state.hex.cursor) {
            dispatch({
                type: HEX_CURSOR_SET,
                pos: new_pos
            });
            const {row, bytes_per_row, rows_per_page} = state.hex.view;
            let new_pos_row = Math.floor(new_pos / bytes_per_row);
            if (new_pos_row < row) {
                dispatch(hex_view_row_set(new_pos_row));
            } else if (new_pos_row >= row + rows_per_page) {
                dispatch(hex_view_row_set(new_pos_row - rows_per_page + 1));
            }
        }
    };
}

export function hex_marked_set(marked) {
    return {
        type: HEX_MARKED_SET,
        marked: marked
    }
}

export function hex_view_row_set(row) {
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
            })
            dispatch(fetch_hex_data_if_needed());
        }
    };
}

function receive_hex_data(start, end, data) {
    return {
        type: HEX_DATA_FETCH_END,
        start: start,
        end: start + PAGE_SIZE,
        data: data
    };
}

function fetch_hex_data(start) {
    return dispatch => {
        let end = start + PAGE_SIZE;
        dispatch({
            type: HEX_DATA_FETCH_START,
            start: start
        });
        return fetch(`data/${start}/${PAGE_SIZE}`)
            .then(req => req.arrayBuffer())
            .then(buf => dispatch(receive_hex_data(start, end, buf)));
    }
}

function should_fetch_hex_data(state) {
    const hex = state.hex;
    if (!hex.fetch.ongoing && hex.data === null) {
        return true;
    }
    const {row, bytes_per_row} = hex.view;
    let pos = row * bytes_per_row;
    let start = hex.fetch.ongoing ? hex.fetch.start : hex.data.start;
    return pos < start || pos >= start + PAGE_BOUNDARY;
}

export function fetch_hex_data_if_needed() {
    return (dispatch, getState) => {
        const state = getState();
        if (should_fetch_hex_data(state)) {
            const {row, bytes_per_row} = state.hex.view;
            return dispatch(
                fetch_hex_data(
                    Math.floor(row * bytes_per_row / PAGE_BOUNDARY) * PAGE_BOUNDARY
                )
            );
        }
    };
}

function receive_metadata(json) {
    return {
        type: METADATA_FETCH_END,
        data: json
    };
}

export function fetch_metadata() {
    return dispatch => {
        dispatch({
            type: METADATA_FETCH_START
        });
        return fetch(`data/infos`)
            .then(req => req.json())
            .then(json => dispatch(receive_metadata(json)));
    }
}

export function trace_set_active(path) {
    return {
        type: TRACE_SET_ACTIVE,
        path: path
    };
}

function receive_trace(json) {
    return {
        type: TRACE_FETCH_END,
        data: json
    };
}

export function fetch_trace() {
    return dispatch => {
        dispatch({
            type: TRACE_FETCH_START
        });
        return fetch(`trace`)
            .then(req => req.json())
            .then(json => dispatch(receive_trace(json)));
    }
}
