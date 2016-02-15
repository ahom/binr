import React from 'react';
import classNames from 'classnames';

export default class TraceView extends React.Component {
    constructor(props: Props) {
        super(props);
        this.state = {
            expanded: false
        };
    }
    render() {
        const {active_trace, trace} = this.props;
        let cls = classNames({
            'traceview-trace': true,
            'traceview-trace-active': active_trace && active_trace.path.length === trace.path.length && active_trace.path.every((el, idx) => el === trace.path[idx])
        });
        const is_in_active_path = active_trace && trace.path.length < active_trace.path.length && trace.path.every((el, idx) => el === active_trace.path[idx]);
        const active_child = is_in_active_path ? active_trace.path[trace.path.length] : 0; 
        const expanded = this.state.expanded || is_in_active_path; 
        const start_child = Math.max(0, active_child - 10);
        return <div
                className="traceview">
            <span 
                className={cls} 
                onClick={(e) => {
                    this.props.set_active_trace(trace);
                }}
                onDoubleClick={(e) => {
                    this.setState({expanded: !this.state.expanded});
                }}>
                    {trace && `${trace.path.length > 0 ? `${trace.path[trace.path.length - 1]}| ` : ''}${trace.call}` || "Loading..."}
            </span>
            {trace && trace.children && expanded && <ol className="traceview-children">
                {trace.children.slice(start_child, active_child + 10).map((child, idx) => <li key={start_child + idx}>
                    <TraceView 
                        active_trace={active_trace} 
                        trace={child} 
                        set_active_trace={this.props.set_active_trace}
                    />
                </li>)}
            </ol>}
        </div>;
    }
}
