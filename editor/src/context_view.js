import React from 'react';
import Highlight from 'react-highlight';

export default class ContextView extends React.Component {
    constructor(props: Props) {
        super(props);
    }
    render() {
        let selection = this.props.trace
            && this.props.trace.selection;
        return <div>
            {selection
                    && selection.file 
                    && selection.file.lines ? <div>
                <Highlight className="python">{selection.file.lines.slice(selection.lineno - 3, selection.lineno - 1).join('\n')}</Highlight>
                <Highlight className="python">{selection.file.lines[selection.lineno - 1]}</Highlight>
                <Highlight className="python">{selection.file.lines.slice(selection.lineno, selection.lineno + 2).join('\n')}</Highlight>
            </div> : ""}
        </div>;
    }
}
