import React from 'react';

class Container extends React.Component {
    render() {
        return <div className="container">
            <div className="container-name">{this.props.name}</div>
            <div className="container-content">{this.props.children}</div>
        </div>;
    }
}

export default Container;
