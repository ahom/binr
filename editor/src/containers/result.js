import React from 'react';
import {connect} from 'react-redux';

import ResultView from '../components/result_view';

const mapStateToProps = (state) => {
    return {
        active_trace: state.trace.active_trace,
        root: state.trace.root
    };
}

export default connect(mapStateToProps)(ResultView);
