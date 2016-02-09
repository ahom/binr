import React from 'react';
import {connect} from 'react-redux';

import {
    hex_marked_set, trace_set_active
} from '../actions';
import TraceView from '../components/trace_view';

const mapStateToProps = (state) => {
    return {
        active_path: state.trace.active_trace,
        path: [],
        trace: state.trace.root
    };
}

const mapDispatchToProps = (dispatch) => {
    return {
        set_active_trace: (path) => dispatch(trace_set_active(path)),
        set_marked: (marked) => dispatch(hex_marked_set(marked))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TraceView);
