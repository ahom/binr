import React from 'react';

export default class HexView extends React.Component {
    constructor(props: Props) {
        super(props);
        this.state = {
            currentRow: 0,
            loading: true,
            selected: 0
        };
        this.fetchData();
    }
    last_row() {
        return Math.floor(this.props.buffer.size() / this.props.bytesPerRow);
    }
    componentWillReceiveProps(newProps) {
        if (newProps.buffer !== this.props.buffer) {
            this.setState({
                currentRow: 0
            });
            this.fetchData(0, newProps);
        }
    }
    fetchData(row, props) {
        row = row === undefined ? this.state.currentRow : row;
        props = props === undefined ? this.props : props;
        props.buffer.read_async(
            row * props.bytesPerRow, 
            props.visibleRows * props.bytesPerRow,
            (data) => {
                this.setState({
                    loading: false
                });
        });
        props.buffer.warmup_neighbors(row * props.bytesPerRow);
    }
    onWheel(e) {
        let new_row = this.state.currentRow + Math.round(e.deltaY / 10.0);
        if (new_row < 0) {
            new_row = 0;
        }
        this.fetchData(new_row);
        this.setState({
            currentRow: new_row
        });
    }
    onMouseDown(offset, e) {
        this.setState({
            selected: offset
        });
    }
    onKeyDown(e) {
        console.log(e.keyCode);
        let delta_row = 0;
        let delta_col = 0;
        switch (e.keyCode) {
            case 37: // left
                delta_col -= 1;
                break;
            case 38: // top
                delta_row -= 1;
                break;
            case 39: // right
                delta_col += 1;
                break;
            case 40: // bottom
                delta_row += 1;
                break;
            case 33: // pageup
                delta_row -= this.props.visibleRows;
                break;
            case 34: // pagedown
                delta_row += this.props.visibleRows;
        }
        let selected_row = Math.floor(this.state.selected / this.props.bytesPerRow);
        let selected_col = this.state.selected % this.props.bytesPerRow; 

        selected_col += delta_col;
        selected_row += delta_row;

        if (selected_col < 0) {
            selected_col = 0;
        } else if (selected_col >= this.props.bytesPerRow) {
            selected_col = this.props.bytesPerRow - 1;
        }
        if (selected_row < 0) {
            selected_row = 0;
        } else if (selected_row > this.last_row()) {
            selected_row = this.last_row();
        }

        let current_row = this.state.currentRow;
        if (selected_row < current_row) {
            current_row = selected_row;
        } else if (selected_row >= current_row + this.props.visibleRows) {
            current_row = selected_row - this.props.visibleRows + 1;
        }

        this.setState({
            currentRow: current_row,
            selected: selected_row * this.props.bytesPerRow + selected_col
        });
        this.fetchData(current_row);
    }
    render() {
        let rows = [];
        let address_size = ((this.state.currentRow + this.props.visibleRows) * this.props.bytesPerRow).toString(16).length;
        let data = this.props.buffer.read(this.state.currentRow * this.props.bytesPerRow, this.props.visibleRows * this.props.bytesPerRow);
        for (let idx = 0; idx < this.props.visibleRows; idx++) { 
            rows.push(
                <HexRow
                        key={idx}
                        data={data ? data.subarray(idx * this.props.bytesPerRow, (idx + 1) * this.props.bytesPerRow) : new Uint8Array()}
                        row={this.state.currentRow + idx}
                        bytesPerRow={this.props.bytesPerRow}
                        address_size={address_size} 
                        selected={this.state.selected}
                        onMouseDownCallback={this.onMouseDown.bind(this)}
                />
            );
        }
        return <ol 
                className="hexview"
                tabIndex="1"
                onWheel={this.onWheel.bind(this)}
                onKeyDown={this.onKeyDown.bind(this)}>
            {rows}
        </ol>;
    }
}

HexView.propTypes = {
    bytesPerRow: React.PropTypes.number,
    visibleRows: React.PropTypes.number,
    pageSize: React.PropTypes.number,
    cachePageCount: React.PropTypes.number
};
HexView.defaultProps = {
    bytesPerRow: 16,
    visibleRows: 50,
    pageSize: 4096,
    cachePageCount: 10
};

class HexRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hovered: null
        };
    }
    onMouseEnter(idx, e) {
        this.setState({
            hovered: idx
        });
    }
    onMouseLeave(idx, e) {
        if (this.state.hovered == idx) {
            this.setState({
                hovered: null
            });
        }
    }
    onMouseDown(idx, e) {
        this.props.onMouseDownCallback(this.props.row * this.props.bytesPerRow + idx, e);
    }
    render() {
        let selected = this.props.selected;
        if (Math.floor(selected / this.props.bytesPerRow) === this.props.row) {
            selected = selected % this.props.bytesPerRow;
        } else {
            selected = null;
        }
        return <li className="hexview-row">
            <HexAddress 
                offset={this.props.row * this.props.bytesPerRow} 
                address_size={this.props.address_size}
            />
            <HexBytes 
                data={this.props.data} 
                bytesPerRow={this.props.bytesPerRow} 
                hovered={this.state.hovered}
                selected={selected}
                onMouseEnterCallback={this.onMouseEnter.bind(this)}
                onMouseLeaveCallback={this.onMouseLeave.bind(this)}
                onMouseDownCallback={this.onMouseDown.bind(this)}
            />
            <HexAscii 
                data={this.props.data}
                bytesPerRow={this.props.bytesPerRow} 
                hovered={this.state.hovered}
                selected={selected}
                onMouseEnterCallback={this.onMouseEnter.bind(this)}
                onMouseLeaveCallback={this.onMouseLeave.bind(this)}
                onMouseDownCallback={this.onMouseDown.bind(this)}
            />
        </li>
    }
}

HexRow.propTypes = {
    row: React.PropTypes.number,
    bytesPerRow: React.PropTypes.number,
    address_size: React.PropTypes.number
};

class HexAddress extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return <span className="hexview-address">{`${Array(this.props.address_size + 1).join('0')}${this.props.offset.toString(16).toUpperCase()}`.slice(-this.props.address_size) + 'h'}</span>;
    }
}

HexAddress.propTypes = {
    offset: React.PropTypes.number,
    address_size: React.PropTypes.number
};

class HexBytes extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let values = [];
        for (let idx = 0; idx < this.props.bytesPerRow; idx++) {
            values.push(
                <span 
                        key={idx} 
                        className={"hexview-byte" 
                            + (this.props.hovered == idx ? " hexview-byte-hovered": "")
                            + (this.props.selected == idx ? " hexview-byte-selected": "")}
                        onMouseEnter={(ev) => this.props.onMouseEnterCallback(idx, ev)}
                        onMouseLeave={(ev) => this.props.onMouseLeaveCallback(idx, ev)}
                        onMouseDown={(ev) => this.props.onMouseDownCallback(idx, ev)}>
                    {idx < this.props.data.length ? `0${this.props.data[idx].toString(16).toUpperCase()}`.slice(-2) : '  '}
                </span>
            );
        }
        return <span className="hexview-bytes">{values}</span>;
    }
}

HexBytes.propTypes = {
    bytesPerRow: React.PropTypes.number,
    hovered: React.PropTypes.number
}

class HexAscii extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let values = [];
        for (let idx = 0; idx < this.props.bytesPerRow; idx++) {
            let val = idx < this.props.data.length ? this.props.data[idx] : 0x20; // space
            values.push(
                <span 
                        key={idx} 
                        className={"hexview-ascii-char" 
                            + (this.props.hovered === idx ? " hexview-ascii-char-hovered": "")
                            + (this.props.selected === idx ? " hexview-ascii-char-selected": "")}
                        onMouseEnter={(ev) => this.props.onMouseEnterCallback(idx, ev)}
                        onMouseLeave={(ev) => this.props.onMouseLeaveCallback(idx, ev)}
                        onMouseDown={(ev) => this.props.onMouseDownCallback(idx, ev)}>
                    {val < 0x20 || val >= 0x7F ? '.' : String.fromCharCode(val)}
                </span>
            );
        }
        return <span className="hexview-ascii">{values}</span>;
    }
}

HexAscii.propTypes = {
    bytesPerRow: React.PropTypes.number,
    hovered: React.PropTypes.number
}
