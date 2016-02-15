import React from 'react';
import ReactDOM from 'react-dom';
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
        // sets the focus at start on the hex view
        ReactDOM.findDOMNode(this.refs.view).focus(); 
    }
    onWheel(e) {
        this.props.set_view_row(this.props.view.row + Math.floor(e.deltaY / 10.0));
        e.preventDefault();
    }
    onCommandKeyDown(e) {
        switch (e.key) {
            case "Enter":
                let command_dom_node = ReactDOM.findDOMNode(this.refs.command); 
                this.props.exec_command(command_dom_node.value);
                command_dom_node.value = '';
                ReactDOM.findDOMNode(this.refs.view).focus(); 
                break;
            case "Escape":
                ReactDOM.findDOMNode(this.refs.view).focus(); 
                break;
        }
    }
    onKeyDown(e) {
        let delta_bytes = 0;
        switch (e.key) {
            case "ArrowLeft":
                if (e.shiftKey) {
                    this.props.step.out();
                } else {
                    delta_bytes -= 1;
                }
                break;
            case "ArrowUp":
                if (e.shiftKey) {
                    this.props.step.over(-1);
                } else {
                    delta_bytes -= this.props.view.bytes_per_row;
                }
                break;
            case "ArrowRight":
                if (e.shiftKey) {
                    this.props.step.in();
                } else {
                    delta_bytes += 1;
                }
                break;
            case "ArrowDown": 
                if (e.shiftKey) {
                    this.props.step.over(1);
                } else {
                    delta_bytes += this.props.view.bytes_per_row;
                }
                break;
            case "PageUp":
                delta_bytes -= this.props.view.bytes_per_row * this.props.view.rows_per_page;
                break;
            case "PageDown":
                delta_bytes += this.props.view.bytes_per_row * this.props.view.rows_per_page;
                break;
            case "s":
                this.props.set_cursor(0);
                break;
            case "e":
                if (this.props.metadata) {
                    this.props.set_cursor(this.props.metadata.size - 1);
                }
                break;

            case ":":
                ReactDOM.findDOMNode(this.refs.command).focus(); 
                break;
        }
        if (delta_bytes !== 0) {
            this.props.set_cursor(this.props.cursor + delta_bytes);
        }
    }
    onMouseDown(e) {
        let offset = get_offset(e);
        if (offset !== null) {
            this.props.set_cursor(offset);
        }
    }
    render() {
        const {view, data, cursor, active_trace, metadata} = this.props;
        const address_size = ((view.row + view.rows_per_page) * view.bytes_per_row).toString(16).length;
        let rows = [];
        let bytes = new Uint8Array();
        let page_marked = [];
        if (data) {
            let start = view.row * view.bytes_per_row;
            let end = start + view.rows_per_page * view.bytes_per_row;
            if (data.start <= start && data.end >= end) {
                bytes = data.bytes.subarray(start - data.start, end - data.start);
            }
            if (active_trace) {
                page_marked = active_trace.offsets
                    .filter((mark) => start < mark[1] && end > mark[0])
                    .map((mark) => [mark[0] - start, mark[1] - start]);
            }
        }
        const cursor_row = Math.floor(cursor / view.bytes_per_row);
        for (let idx = 0; idx < view.rows_per_page; idx++) { 
            const cursor_col = (cursor_row === view.row + idx) ? cursor % view.bytes_per_row : null;
            const start = idx * view.bytes_per_row;
            const end = (idx + 1) * view.bytes_per_row;
            const row_marked = page_marked
                .filter((mark) => start < mark[1] && end > mark[0])
                .map((mark) => [mark[0] - start, mark[1] - start]);
            rows.push(
                <HexRow
                        key={idx}
                        bytes={bytes.subarray(start, end)}
                        offset={start + view.row * view.bytes_per_row}
                        bytes_per_row={view.bytes_per_row}
                        address_size={address_size} 
                        cursor={cursor_col}
                        marked={row_marked}
                />
            );
        }
        return <div className="col">
            <ol
                    className="hexview"
                    tabIndex="1"
                    ref="view"
                    onMouseDown={this.onMouseDown.bind(this)}
                    onWheel={this.onWheel.bind(this)}
                    onKeyDown={this.onKeyDown.bind(this)}>
                {rows}
            </ol>
            <div className="hexview-status">
                <span className="hexview-status-left">
                    {metadata && metadata.name}
                </span>
                <span className="hexview-status-right">
                    {cursor}
                    {metadata && ` | ${Math.floor(cursor * 100 / (metadata.size - 1))}%`}
                </span>
            </div>
            <input 
                className="hexview-command" 
                ref="command" 
                type="text"
                onKeyDown={this.onCommandKeyDown.bind(this)}
            />
        </div>;
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
                cursor={this.props.cursor}
                marked={this.props.marked}
            />
            <HexAscii 
                bytes={this.props.bytes} 
                bytes_per_row={this.props.bytes_per_row} 
                offset={this.props.offset}
                hovered={this.state.hovered}
                cursor={this.props.cursor}
                marked={this.props.marked}
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
                'hexview-byte-marked': this.props.marked.some((mark) => idx >= mark[0] && idx < mark[1]),
                'hexview-byte-cursor': this.props.cursor === idx,
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
                'hexview-ascii-char-marked': this.props.marked.some((mark) => idx >= mark[0] && idx < mark[1]),
                'hexview-ascii-char-cursor': this.props.cursor === idx, 
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

