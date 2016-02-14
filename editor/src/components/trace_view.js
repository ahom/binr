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
        const is_in_active_path = path.length < active_path.length && path.every((el, idx) => el === active_path[idx]);
        const active_child = is_in_active_path ? active_path[path.length] : 0; 
        const expanded = this.state.expanded || is_in_active_path; 
        const start_child = Math.max(0, active_child - 4);
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
                    {trace && `${path.length > 0 ? `${path[path.length - 1]}| ` : ''}${trace.call}` || "Loading..."}
            </span>
            {trace && trace.children && expanded && <ol className="traceview-children">
                {trace.children.slice(start_child, active_child + 4).map((child, idx) => <li key={start_child + idx}>
                    <TraceView 
                        active_path={active_path} 
                        trace={child} 
                        path={[...path, start_child + idx]} 
                        set_active_trace={this.props.set_active_trace}
                        set_marked={this.props.set_marked}
                    />
                </li>)}
            </ol>}
        </div>;
    }
}
