import React from 'react';

export default class TraceView extends React.Component {
    constructor(props: Props) {
        super(props);
        this.state = {
            expanded: false
        }
    }
    onClick() {
        if (this.props.trace) {
            this.setState({
                expanded: !this.state.expanded
            });
            for (let i = 0; i < this.props.trace.children_count; ++i) {
                this.props.fetch_trace(this.props.trace.path.concat([i]));
            }
        }
    }
    render() {
        return <div>
            <span onClick={this.onClick.bind(this)}>{this.props.trace ? this.props.trace.call : "Loading..."}</span>
            {this.state.expanded && this.props.trace && this.props.trace.children ? <ol>
                {this.props.trace.children.map((tr) => <li><TraceView fetch_trace={this.props.fetch_trace} trace={tr} /></li>)}
            </ol> : ""}
        </div>;
    }
}
