import React from 'react';

export default class ResultView extends React.Component {
    render() {
        const {active_trace, root} = this.props;
        let trace = root;
        for (let idx of active_trace) {
            if (trace) {
                trace = trace.children[idx];
            }
        }
        return <div
                className="resultview">
            {trace && [
                <div key={"caller"} className="resultview-caller">{trace.caller}</div>,
                <div key={"result"} className="resultview-result">{trace.result}</div>
            ]}
        </div>;
    }
}
