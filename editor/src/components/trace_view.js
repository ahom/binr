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
        const {active_path, trace, path} = this.props;
        let cls = classNames({
            'traceview-trace': true,
            'traceview-trace-active': active_path.length === path.length && active_path.every((el, idx) => el === path[idx])
        });
        return <div
                className="traceview">
            <span 
                className={cls} 
                onClick={(e) => {
                    this.props.set_active_trace(path);
                    this.props.set_marked(trace.offsets);
                }}
                onDoubleClick={(e) => {
                    this.setState({expanded: !this.state.expanded});
                }}>
                    {trace && trace.call || "Loading..."}
            </span>
            {trace && trace.children && this.state.expanded && <ol className="traceview-children">
                {trace.children.map((child, idx) => <li key={idx}>
                    <TraceView 
                        active_path={active_path} 
                        trace={child} 
                        path={[...path, idx]} 
                        set_active_trace={this.props.set_active_trace}
                        set_marked={this.props.set_marked}
                        fetch_trace_if_needed={this.props.fetch_trace_if_needed}
                    />
                </li>)}
            </ol>}
        </div>;
    }
}
