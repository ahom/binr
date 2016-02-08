import React, {Component} from 'react';
import {Provider} from 'react-redux';
import configure_store from '../configure_store';
import App from '../components/app';

const store = configure_store();

export default class Root extends Component {
    render() {
        return (
            <Provider store={store}>
                <App />
            </Provider>
        )
    }
}
