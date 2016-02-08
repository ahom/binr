import React from 'react';
import {connect} from 'react-redux';

import {
    trace_set_active, fetch_trace_if_needed
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
        fetch_trace_if_needed: () => dispatch(fetch_trace_if_needed())
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TraceView);
