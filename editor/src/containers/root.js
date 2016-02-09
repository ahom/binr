import React, {Component} from 'react';
import {Provider} from 'react-redux';

import {
    fetch_metadata, fetch_hex_data_if_needed, fetch_trace
} from '../actions';
import configure_store from '../configure_store';
import App from '../components/app';

const store = configure_store();

export default class Root extends Component {
    componentDidMount() {
        store.dispatch(fetch_metadata());
        store.dispatch(fetch_hex_data_if_needed());
        store.dispatch(fetch_trace());
    }
    render() {
        return (
            <Provider store={store}>
                <App />
            </Provider>
        )
    }
}
