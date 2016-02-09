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
        const {data, cursor} = this.props;
        let dview = null;
        if (data && cursor >= data.start && cursor < data.end) {
            dview = new DataView(data.bytes.slice(cursor - data.start, cursor - data.start + 8).buffer); 
        }
        return <table
                className="inspectorview">
            <thead>
                <tr>
                    <td>Type</td>
                    <td>le</td>
                    <td>be</td>
                </tr>
            </thead>
            <tbody>
                {dview && types.map((values, idx) => {
                    const [name, func] = values;
                    return <tr key={idx}>
                        <td className="inspector-name">{name}</td>
                        <td className="inspector-value">{dview[func](0, true)}</td>
                        <td className="inspector-value">{dview[func](0, false)}</td>
                    </tr>;
                })}
            </tbody>
        </table>;
    }
}
