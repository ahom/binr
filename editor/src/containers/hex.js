import React from 'react';
import {connect} from 'react-redux';

import {
    hexCursorPosSet, hexViewRowSet,
    fetchMetadataIfNeeded, fetchHexDataIfNeeded
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
        set_cursor_pos: (pos) => dispatch(hexCursorPosSet(pos)),
        set_view_row: (row) => dispatch(hexViewRowSet(row)),
        fetch_metadata_if_needed: () => dispatch(fetchMetadataIfNeeded()),
        fetch_hex_data_if_needed: () => dispatch(fetchHexDataIfNeeded())
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(HexView);
