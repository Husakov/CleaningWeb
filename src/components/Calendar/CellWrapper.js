import React, {Component} from 'react';

class ColoredCellWrapper extends Component {
    state = {
        open: false
    };

    toggle() {
        this.setState({
            open: !this.state.open
        });
    };

    render() {
        return (
            <div style={{backgroundColor: "red"}}>
                {this.props.children}
            </div>
        )
    }
}


export default ColoredCellWrapper;
