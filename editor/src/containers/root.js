import React, {Component} from 'react';
import {Provider} from 'react-redux';
import configureStore from '../configure_store';
import App from '../components/app';

const store = configureStore();

export default class Root extends Component {
    render() {
        return (
            <Provider store={store}>
                <App />
            </Provider>
        )
    }
}
