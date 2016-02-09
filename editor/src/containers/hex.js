import React from 'react';
import {connect} from 'react-redux';

import {
    hex_cursor_set, hex_view_row_set
} from '../actions';
import HexView from '../components/hex_view';

const mapStateToProps = (state) => {
    return {
        data: state.hex.data,
        view: state.hex.view,
        cursor: state.hex.cursor,
        marked: state.hex.marked
    };
}

const mapDispatchToProps = (dispatch) => {
    return {
        set_cursor: (pos) => dispatch(hex_cursor_set(pos)),
        set_view_row: (row) => dispatch(hex_view_row_set(row))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(HexView);
