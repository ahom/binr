import React from 'react';

export default class TraceView extends React.Component {
    constructor(props: Props) {
        super(props);
        this.state = {
            expanded: false
        }
    }
    onClick() {
        this.props.select_trace(this.props.current_trace);
    }
    onDoubleClick() {
        if (this.props.trace) {
            this.setState({
                expanded: !this.state.expanded
            });
            if (!this.props.current_trace.children) {
                for (let i = 0; i < this.props.current_trace.children_count; ++i) {
                    this.props.fetch_trace(this.props.current_trace.path.concat([i]));
                }
            }
        }
    }
    render() {
        if (!this.props.current_trace) {
            return <span className="traceview">{"Loading..."}</span>
        }
        let folded_sign = this.props.current_trace.children_count > 0 ? (this.state.expanded ? "- " : "+ ") : "";
        return <div>
            <span 
                    className={"traceview"
                        + (this.props.current_trace === this.props.trace.selection ? " traceview-selected" : "")}
                    onClick={this.onClick.bind(this)} 
                    onDoubleClick={this.onDoubleClick.bind(this)}>
                {folded_sign + this.props.current_trace.call}
            </span>
            {this.state.expanded && this.props.current_trace.children ? <ol className="traceview-node">
                {this.props.current_trace.children.map((tr, idx) => <li key={idx}>
                        <TraceView 
                            trace={this.props.trace}
                            current_trace={tr}
                            select_trace={this.props.select_trace} 
                            fetch_trace={this.props.fetch_trace} 
                        />
                </li>)}
            </ol> : ""}
        </div>;
    }
}
