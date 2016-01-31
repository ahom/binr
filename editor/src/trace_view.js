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
        return <div>
            <span 
                    className={this.props.current_trace === this.props.trace.selection ? "traceview-selected" : ""}
                    onClick={this.onClick.bind(this)} 
                    onDoubleClick={this.onDoubleClick.bind(this)}>
                {this.props.current_trace ? this.props.current_trace.call : "Loading..."}
            </span>
            {this.state.expanded 
                && this.props.current_trace 
                    && this.props.current_trace.children ? <ol>
                {this.props.current_trace.children.map((tr) => <li>
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
