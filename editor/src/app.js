import React from 'react';
import update from 'react-addons-update';

import HexView from './hex_view';
import TraceView from './trace_view';
import ContextView from './context_view';

import SourceStore from './source_store';
import TraceStore from './trace_store';

import {throttle} from './utils';

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            source: {
                buffer: null,
                infos: null,
                selection: null
            },
            trace: {
                root: null,
                selection: null
            }
        };
        this.source_store = new SourceStore();
        this.trace_store = new TraceStore();
    }
    componentDidMount() {
        this.source_store.fetch_infos().then((val) => {
            this.setState(update(this.state, { source: { infos: { $set: val }}}));
        });
        this.trace_store.fetch_root().then((val) => {
            this.setState(update(this.state, { trace: { root: { $set: val }}}));
        });
    }
    fetch_data(start) {
        this.source_store.read(start).then((res) => this.setState(update(this.state, { source: { buffer: { $set: res }}})));
    }
    fetch_trace(path) {
        this.trace_store.fetch(path).then(() => this.setState(update(this.state, { trace: { root: { $set: this.trace_store.root }}})));
    }
    select_trace(trace) {
        this.setState(update(this.state, { trace: { selection: { $set: trace }}}));
    }
    render() {
        return <div>
            <HexView 
                selected_trace={this.state.trace.selection}
                source={this.state.source}
                fetch_data={throttle(this.fetch_data.bind(this), 1000)}
            />
            <TraceView 
                trace={this.state.trace} 
                current_trace={this.state.trace.root}
                fetch_trace={this.fetch_trace.bind(this)}
                select_trace={this.select_trace.bind(this)}
            />
            <ContextView 
                trace={this.state.trace} 
            />
        </div>;
    }
}

