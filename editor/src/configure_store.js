import {createStore, applyMiddleware} from 'redux';
import thunk_middleware from 'redux-thunk';
import create_logger from 'redux-logger';
import root_reducer from './reducers';

const logger_middleware = create_logger();

export default function configure_store(initial_state) {
    return createStore(
        root_reducer,
        initial_state,
        applyMiddleware(
            thunk_middleware,
            logger_middleware
        )
    );
}
