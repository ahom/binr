import {combineReducers} from 'redux';
import {
    HEX_VIEW_ROW_SET, HEX_CURSOR_POS_SET,
    HEX_DATA_FETCH_START, HEX_DATA_FETCH_END,
    METADATA_FETCH_START, METADATA_FETCH_END
} from './actions';
import update from 'react-addons-update';

function metadataReducer(state = {
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

function hexReducer(state = {
    fetch: {
        ongoing: false
    },
    data: null,
    view: {
        row: 0,
        bytes_per_row: 16,
        rows_per_page: 50
    },
    cursor_pos: 0
}, action) {
    switch (action.type) {
        case HEX_CURSOR_POS_SET:
            return update(state, {cursor_pos: {$set: action.pos}}); 
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

function traceReducer(state = {
    is_fetching: false,
    root: null,
    active_trace: []
}, action) {
    return state;
}

const rootReducer = combineReducers({
    metadata: metadataReducer,
    hex: hexReducer,
    trace: traceReducer
})

export default rootReducer
