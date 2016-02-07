import React from 'react';
import classNames from 'classnames';

const types = [
    ['int8', 'getInt8'],
    ['uint8', 'getUint8'],
    ['int16', 'getInt16'],
    ['uint16', 'getUint16'],
    ['int32', 'getInt32'],
    ['uint32', 'getUint32'],
    ['float32', 'getFloat32'],
    ['float64', 'getFloat64']
]

export default class InspectorView extends React.Component {
    constructor(props: Props) {
        super(props);
    }
    render() {
        const {data, cursor_pos} = this.props;
        let bytes = new Uint8Array();
        if (data && cursor_pos >= data.start && cursor_pos < data.end) {
            bytes = data.bytes.slice(cursor_pos - data.start, cursor_pos - data.start + 8); 
        }
        let dview = new DataView(bytes.buffer);
        return <table
                className="inspectorview">
            <thead>
                <td>Type</td>
                <td>le</td>
                <td>be</td>
            </thead>
            <tbody>
                {data && types.map((values) => {
                    const [name, func] = values;
                    return <tr>
                        <td className="inspector-name">{name}</td>
                        <td className="inspector-value">{dview[func](0, true)}</td>
                        <td className="inspector-value">{dview[func](0, false)}</td>
                    </tr>;
                })}
            </tbody>
        </table>;
    }
}
