import React from 'react';

export default class FileOpener extends React.Component {
    constructor(props) {
        super(props);
    }
    onChange(e) {
        if (this.props.onChange) {
            this.props.onChange(e.target.files.item(0));
        }
    }
    render() {
        return <input
                type="file" 
                name="Select file..." 
                onChange={this.onChange.bind(this)}
        />;
    }
}

