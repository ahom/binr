import React from 'react';
import classNames from 'classnames';

function get_offset(e) {
    if (e.target && e.target.tagName === "SPAN" && e.target.getAttribute) {
        let attr = e.target.getAttribute("data-offset");
        if (attr !== undefined) {
            let value = parseInt(attr);
            if (!isNaN(value))
            {
                return value;
            }
        }
    }
    return null;
}

export default class HexView extends React.Component {
    constructor(props: Props) {
        super(props);
    }
    componentDidMount() {
        this.props.fetch_metadata_if_needed();
        this.props.fetch_hex_data_if_needed();
    }
    componentWillReceiveProps(next_props) {
        if (this.props.view !== next_props.view) {
            this.props.fetch_hex_data_if_needed();
        }
    }
    onWheel(e) {
        this.props.set_view_row(this.props.view.row + Math.floor(e.deltaY / 10.0));
    }
    onKeyDown(e) {
        let delta_bytes = 0;
        switch (e.keyCode) {
            case 37: // left
                delta_bytes -= 1;
                break;
            case 38: // top
                delta_bytes -= this.props.view.bytes_per_row;
                break;
            case 39: // right
                delta_bytes += 1;
                break;
            case 40: // bottom
                delta_bytes += this.props.view.bytes_per_row;
                break;
            case 33: // pageup
                delta_bytes -= this.props.view.bytes_per_row * this.props.view.rows_per_page;
                break;
            case 34: // pagedown
                delta_bytes += this.props.view.bytes_per_row * this.props.view.rows_per_page;
        }
        this.props.set_cursor_pos(this.props.cursor_pos + delta_bytes);
    }
    onMouseDown(e) {
        let offset = get_offset(e);
        if (offset !== null) {
            this.props.set_cursor_pos(offset);
        }
    }
    render() {
        const {view, data, cursor_pos} = this.props;
        let rows = [];
        let address_size = ((view.row + view.rows_per_page) * view.bytes_per_row).toString(16).length;
        let bytes = new Uint8Array();
        if (data) {
            let start = view.row * view.bytes_per_row;
            let end = start + view.rows_per_page * view.bytes_per_row;
            if (data.start <= start && data.end >= end) {
                bytes = data.bytes.subarray(start - data.start, end - data.start);
            }
        }
        let cursor_row = Math.floor(cursor_pos / view.bytes_per_row);
        for (let idx = 0; idx < view.rows_per_page; idx++) { 
            let cursor_col = (cursor_row === view.row + idx) ? cursor_pos % view.bytes_per_row : null;
            rows.push(
                <HexRow
                        key={idx}
                        bytes={bytes.subarray(idx * view.bytes_per_row, (idx + 1) * view.bytes_per_row)}
                        offset={(view.row + idx) * view.bytes_per_row}
                        bytes_per_row={view.bytes_per_row}
                        address_size={address_size} 
                        cursor_pos={cursor_col}
                />
            );
        }
        return <ol
                className="hexview"
                tabIndex="1"
                onMouseDown={this.onMouseDown.bind(this)}
                onWheel={this.onWheel.bind(this)}
                onKeyDown={this.onKeyDown.bind(this)}>
            {rows}
        </ol>;
    }
}

class HexRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hovered: null
        };
    }
    onMouseOver(e) {
        let offset = get_offset(e);
        if (offset !== null) {
            this.setState({
                hovered: offset - this.props.offset
            });
        }
    }
    onMouseOut(e) {
        let offset = get_offset(e);
        if (offset !== null) {
            if (this.state.hovered === offset - this.props.offset) {
                this.setState({
                    hovered: null
                });
            }
        }
    }
    render() {
        return <li 
                className="hexview-row"
                onMouseOver={this.onMouseOver.bind(this)}
                onMouseOut={this.onMouseOut.bind(this)}>
            <HexAddress 
                offset={this.props.offset} 
                address_size={this.props.address_size}
            />
            <HexBytes 
                bytes={this.props.bytes} 
                bytes_per_row={this.props.bytes_per_row} 
                offset={this.props.offset}
                hovered={this.state.hovered}
                cursor_pos={this.props.cursor_pos}
            />
            <HexAscii 
                bytes={this.props.bytes} 
                bytes_per_row={this.props.bytes_per_row} 
                offset={this.props.offset}
                hovered={this.state.hovered}
                cursor_pos={this.props.cursor_pos}
            />
        </li>
    }
}

class HexAddress extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return <span className="hexview-address">
            {`${Array(this.props.address_size + 1).join('0')}${this.props.offset.toString(16).toUpperCase()}`.slice(-this.props.address_size) + 'h'}
        </span>;
    }
}

class HexBytes extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let values = [];
        for (let idx = 0; idx < this.props.bytes_per_row; idx++) {
            let cls = classNames({
                'hexview-byte': true,
                'hexview-byte-cursor': this.props.cursor_pos === idx,
                'hexview-byte-hovered': this.props.hovered === idx
            });
            values.push(
                <span 
                        key={idx} 
                        className={cls}
                        data-offset={this.props.offset + idx}>
                    {idx < this.props.bytes.length ? `0${this.props.bytes[idx].toString(16).toUpperCase()}`.slice(-2) : '  '}
                </span>
            );
        }
        return <span className="hexview-bytes">{values}</span>;
    }
}

class HexAscii extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let values = [];
        for (let idx = 0; idx < this.props.bytes_per_row; idx++) {
            let val = idx < this.props.bytes.length ? this.props.bytes[idx] : 0x20; // space
            let cls = classNames({
                'hexview-ascii-char': true,
                'hexview-ascii-char-cursor': this.props.cursor_pos === idx, 
                'hexview-ascii-char-hovered': this.props.hovered === idx
            });
            values.push(
                <span 
                        key={idx} 
                        className={cls}
                        data-offset={this.props.offset + idx}>
                    {val < 0x20 || val >= 0x7F ? '.' : String.fromCharCode(val)}
                </span>
            );
        }
        return <span className="hexview-ascii">{values}</span>;
    }
}

