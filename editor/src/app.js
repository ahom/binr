import React from 'react';

import FileOpener from './file_opener';
import HexView from './hexview';

import FileBuffer from './file_buffer';

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            buffer: new FileBuffer(null)
        };
    }
    onFileChange(file) {
        this.setState({
            buffer: new FileBuffer(file)
        });
    }
    render() {
        return <div>
            <FileOpener onChange={this.onFileChange.bind(this)}/>
            <HexView buffer={this.state.buffer}/>
        </div>;
    }
}

