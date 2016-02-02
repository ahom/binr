import React from 'react';
import Highlight from 'react-highlight';

export default class ContextView extends React.Component {
    constructor(props: Props) {
        super(props);
    }
    render() {
        let selection = this.props.trace;
        return <div className="context-container">
            {selection
                    && selection.file 
                    && selection.file.lines ? [ 
                <div className="context-result-container">
                    {"Result:"}
                    <Highlight className="javascript">{selection.result}</Highlight>
                </div>,
                <div className="context-file-container">
                    {"Source: " + selection.filename + "#" + selection.lineno}
                    <Highlight className="python">{selection.file.lines.slice(selection.lineno - 3, selection.lineno - 1).join('\n')}</Highlight>
                    <div className="context-line-container">
                        <Highlight className="python">{selection.file.lines[selection.lineno - 1]}</Highlight>
                    </div>
                    <Highlight className="python">{selection.file.lines.slice(selection.lineno, selection.lineno + 2).join('\n')}</Highlight>
                </div>] : ""}
        </div>;
    }
}
