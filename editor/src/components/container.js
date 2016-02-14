import React from 'react';

class Container extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            expanded: true
        };
    }
    render() {
        return <div className="container">
            <div 
                    className="container-name"
                    onClick={(e) => this.setState({ expanded: !this.state.expanded })}>
                {`${this.state.expanded ? "-" : "+"} ${this.props.name}`}
            </div>
            <div 
                    className="container-content"
                    style={{
                        display: (this.state.expanded ? "block" : "none")
                    }}>
                {this.props.children}
            </div>
        </div>;
    }
}

export default Container;
