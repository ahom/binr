import React from 'react';
import {connect} from 'react-redux';

import InspectorView from '../components/inspector_view';

const mapStateToProps = (state) => {
    return {
        data: state.hex.data,
        cursor: state.hex.cursor
    };
}

export default connect(mapStateToProps)(InspectorView);
