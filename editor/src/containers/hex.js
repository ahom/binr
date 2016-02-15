import React from 'react';
import {connect} from 'react-redux';

import {
    hex_cursor_set, hex_view_row_set, command_exec,
    trace_step_in, trace_step_over, trace_step_out
} from '../actions';
import HexView from '../components/hex_view';

const mapStateToProps = (state) => {
    return {
        data: state.hex.data,
        view: state.hex.view,
        cursor: state.hex.cursor,
        active_trace: state.trace.active_trace,
        metadata: state.metadata.data
    };
}

const mapDispatchToProps = (dispatch) => {
    return {
        set_cursor: (pos) => dispatch(hex_cursor_set(pos)),
        set_view_row: (row) => dispatch(hex_view_row_set(row)),
        exec_command: (command_line) => dispatch(command_exec(command_line)),
        step: {
            in: () => dispatch(trace_step_in(1)),
            over: (step) => dispatch(trace_step_over(step)),
            out: () => dispatch(trace_step_out(1))
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(HexView);
