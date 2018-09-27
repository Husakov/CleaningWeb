import React, {Component} from 'react';
import Toggle from '../Toggle';
import './Staff.css';

class Service extends Component {
    constructor(props) {
        super(props);
        this.state = {
            active: props.active
        }
    }

    componentWillReceiveProps(newProps) {
        this.setState({active: newProps.active})
    }

    toggle() {
        this.props.toggleService(this.props.staff_id, this.props.service_id, this.props.staff);
        this.setState({active: !this.state.active})
    }

    render() {
        return (
            <div className="staff-service">
                <Toggle
                    inactiveText="Off"
                    activeText="On"
                    onClick={() => {
                        this.toggle();
                    }}
                    value={this.state.active}/>
                <span>{this.props.name}</span>
            </div>
        );
    }
}

export default Service;
