import React from 'react';

export default class ResultView extends React.Component {
    render() {
        const {active_trace} = this.props;
        return <div
                className="resultview">
            {active_trace && [
                <div key={"caller"} className="resultview-caller">{active_trace.caller}</div>,
                <div key={"result"} className="resultview-result">{JSON.stringify(active_trace.result, null, '\t')}</div>
            ]}
        </div>;
    }
}
