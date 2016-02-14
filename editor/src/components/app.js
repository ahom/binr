import React from 'react';

import Container from './container';
import Hex from '../containers/hex';
import Inspector from '../containers/inspector';
import Trace from '../containers/trace';
import Result from '../containers/result';

const App = () => <div className="col">
    <div className="row">
        <Container name="hex">
            <Hex />
        </Container>
        <div className="col">
            <Container name="trace">
                <Trace />
            </Container>
            <Container name="result">
                <Result />
            </Container>
        </div>
    </div>
    <Container name="inspector">
        <Inspector />
    </Container>
</div>;

export default App;
