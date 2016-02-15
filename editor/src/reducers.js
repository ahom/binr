import {combineReducers} from 'redux';
import {
    HEX_VIEW_ROW_SET, HEX_MARKED_SET, HEX_CURSOR_SET,
    HEX_DATA_FETCH_START, HEX_DATA_FETCH_END,
    METADATA_FETCH_START, METADATA_FETCH_END,
    TRACE_SET_ACTIVE, TRACE_FETCH_START, TRACE_FETCH_END
} from './actions';
import update from 'react-addons-update';

function metadata_reducer(state = {
    is_fetching: false,
    data: null
}, action) {
    switch (action.type) {
        case METADATA_FETCH_START:
            return update(state, {is_fetching: {$set: true}});
        case METADATA_FETCH_END:
            return update(state, {
                is_fetching: {$set: false},
                data: {$set: action.data}
            });
        default:
            return state;
    }
}

function hex_reducer(state = {
    fetch: {
        ongoing: false
    },
    data: null,
    view: {
        row: 0,
        bytes_per_row: 16,
        rows_per_page: 50
    },
    cursor: 0
}, action) {
    switch (action.type) {
        case HEX_CURSOR_SET:
            return update(state, {cursor: {$set: action.pos}}); 
        case HEX_VIEW_ROW_SET:
            return update(state, {view: {row: {$set: action.row}}}); 
        case HEX_DATA_FETCH_START:
            return update(state, {
                fetch: {
                    $set: {
                        ongoing: true,
                        start: action.start
                    }
                }
            });
        case HEX_DATA_FETCH_END:
            if (state.fetch.ongoing && state.fetch.start === action.start) {
                return update(state, {
                    fetch: {
                        $set: {
                            ongoing: false
                        }
                    },
                    data: {
                        $set: {
                            bytes: new Uint8Array(action.data),
                            start: action.start,
                            end: action.end
                        }
                    }
                });
            } else {
                return state; // ignore in case we are waiting for a different block
            }
        default:
            return state;
    }
}

function trace_reducer(state = {
    is_fetching: false,
    root: null,
    active_trace: null 
}, action) {
    switch (action.type) {
        case TRACE_SET_ACTIVE:
            return update(state, {active_trace: {$set: action.trace}});
        case TRACE_FETCH_START:
            return update(state, {is_fetching: {$set: true}});
        case TRACE_FETCH_END:
            return update(state, {
                is_fetching: {$set: false},
                root: {$set: action.data}
            });
        default:
            return state;
    }
}

const root_reducer = combineReducers({
    metadata: metadata_reducer,
    hex: hex_reducer,
    trace: trace_reducer
})

export default root_reducer
