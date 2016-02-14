import React from 'react';

import Container from './container';
import Hex from '../containers/hex';
import Inspector from '../containers/inspector';
import Trace from '../containers/trace';
import Result from '../containers/result';

const App = () => <div className="row">
    <div className="col">
        <Container name="hex">
            <Hex />
        </Container>
        <Container name="inspector">
            <Inspector />
        </Container>
    </div>
    <div className="col">
        <Container name="trace">
            <Trace />
        </Container>
        <Container name="result">
            <Result />
        </Container>
    </div>
</div>;

export default App;
