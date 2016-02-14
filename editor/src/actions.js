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
            const new_pos_row = Math.floor(new_pos / bytes_per_row);
            if (new_pos_row < row) {
                dispatch(hex_view_row_set(new_pos_row));
            } else if (new_pos_row >= row + rows_per_page) {
                dispatch(hex_view_row_set(new_pos_row - rows_per_page + 1));
            }
        }
    };
}

export function hex_marked_set(marked) {
    return (dispatch, getState) => {
        if (marked.length > 0) {
            const {row, bytes_per_row, rows_per_page} = getState().hex.view;
            const start = row * bytes_per_row;
            const end = start + rows_per_page * bytes_per_row;
            const start_offset = marked[0][0];
            if (start > start_offset || end <= start_offset) {
                dispatch(hex_view_row_set(Math.floor(start_offset / bytes_per_row)));
            }
        }
        dispatch({
            type: HEX_MARKED_SET,
            marked: marked
        });
    };
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
        const end = start + PAGE_SIZE;
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
    const pos = row * bytes_per_row;
    const start = hex.fetch.ongoing ? hex.fetch.start : hex.data.start;
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

function traces_path(state) {
    if (state.trace.root) {
        let traces = [state.trace.root];
        let trace = state.trace.root;
        for (let idx of state.trace.active_trace) {
            trace = trace.children[idx];
            traces.push(trace);
        }
        return traces;
    }
    return null;
}

export function command_exec(command_line) {
    return (dispatch, getState) => {
        const state = getState();
        if (command_line.length > 0) {
            if (command_line[0] === ':') {
                const splitted_line = command_line.slice(1).split(' ');
                switch (splitted_line[0]) {
                    case 'g':
                    case 'go':
                    case 'goto':
                        {
                            const val = splitted_line[1];
                            let int_val = parseInt(val);
                            if (val[0] === '+' || val[0] === '-') {
                                int_val += state.hex.cursor;
                            }
                            dispatch(hex_cursor_set(int_val));
                        }
                        break;

                    case 'e':
                    case 'end':
                        if (state.metadata.data) {
                            dispatch(hex_cursor_set(state.metadata.data.size - 1));
                        }
                        break;

                    case 's':
                    case 'start':
                        dispatch(hex_cursor_set(0));
                        break;

                    case 'lt':
                    case 'last-trace':
                        if (state.trace.root) {
                            let path = [];
                            let trace = state.trace.root;
                            while (trace.children.length > 0) {
                                const last_child_id = trace.children.length - 1;
                                trace = trace.children[last_child_id];
                                path.push(last_child_id);
                            }
                            dispatch(trace_set_active(path));
                            dispatch(hex_marked_set(trace.offsets));
                        }
                        break;

                    case 'ft':
                    case 'first-trace':
                        if (state.trace.root) {
                            dispatch(trace_set_active([]));
                            dispatch(hex_marked_set(state.trace.root.offsets));
                        }
                        break;

                    case 'sin':
                    case 'step-in':
                        {
                            const steps = splitted_line[1] !== undefined ? parseInt(splitted_line[1]) : 1;
                            const traces = traces_path(state);
                            if (steps > 0 && traces !== null) {
                                let active_trace = traces[traces.length - 1];
                                let active_path = state.trace.active_trace;
                                if (active_trace.children.length > 0) {
                                    for (let idx = 0; idx < steps; idx++) {
                                        if (active_trace.children.length === 0) {
                                            break;
                                        }
                                        active_path = [...active_path, 0];
                                        active_trace = active_trace.children[0];
                                    }
                                    dispatch(trace_set_active(active_path));
                                    dispatch(hex_marked_set(active_trace.offsets));
                                }
                            }
                        }
                        break;

                    case 'sov':
                    case 'step-over':
                        {
                            const steps = splitted_line[1] !== undefined ? parseInt(splitted_line[1]) : 1;
                            const traces = traces_path(state);
                            if (traces !== null && traces.length > 1) {
                                const active_trace = traces[traces.length - 1];
                                const parent_trace = traces[traces.length - 2];
                                const current_child_pos = state.trace.active_trace[state.trace.active_trace.length - 1];
                                const new_child_pos = Math.max(
                                    Math.min(
                                        current_child_pos + steps,
                                        parent_trace.children.length - 1
                                    ),
                                    0
                                );
                                if (new_child_pos != current_child_pos) {
                                    dispatch(trace_set_active([...state.trace.active_trace.slice(0, state.trace.active_trace.length - 1), new_child_pos]));
                                    dispatch(hex_marked_set(parent_trace.children[new_child_pos].offsets));
                                }
                            }
                        }
                        break;

                    case 'sou':
                    case 'step-out':
                        {
                            let steps = splitted_line[1] !== undefined ? parseInt(splitted_line[1]) : 1;
                            const traces = traces_path(state);
                            if (steps > 0 && traces !== null && traces.length > 1) {
                                steps = Math.min(
                                    traces.length - 1,
                                    steps
                                );
                                dispatch(trace_set_active(state.trace.active_trace.slice(0, traces.length - steps - 1)));
                                dispatch(hex_marked_set(traces[traces.length - 1 - steps].offsets));
                            }
                        }
                        break;
                }
            }
        }
    }
}
