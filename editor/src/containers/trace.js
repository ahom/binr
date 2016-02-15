import React from 'react';
import {connect} from 'react-redux';

import {
    hex_marked_set, trace_set_active
} from '../actions';
import TraceView from '../components/trace_view';

const mapStateToProps = (state) => {
    return {
        active_trace: state.trace.active_trace,
        trace: state.trace.root
    };
}

const mapDispatchToProps = (dispatch) => {
    return {
        set_active_trace: (trace) => dispatch(trace_set_active(trace)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TraceView);
