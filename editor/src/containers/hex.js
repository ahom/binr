import React from 'react';
import {connect} from 'react-redux';

import {
    hex_cursor_pos_set, hex_view_row_set,
    fetch_metadata_if_needed, fetch_hex_data_if_needed
} from '../actions';
import HexView from '../components/hex_view';

const mapStateToProps = (state) => {
    return {
        data: state.hex.data,
        view: state.hex.view,
        cursor_pos: state.hex.cursor_pos
    };
}

const mapDispatchToProps = (dispatch) => {
    return {
        set_cursor_pos: (pos) => dispatch(hex_cursor_pos_set(pos)),
        set_view_row: (row) => dispatch(hex_view_row_set(row)),
        fetch_metadata_if_needed: () => dispatch(fetch_metadata_if_needed()),
        fetch_hex_data_if_needed: () => dispatch(fetch_hex_data_if_needed())
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(HexView);
