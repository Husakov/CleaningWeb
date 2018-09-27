import React, {Component} from 'react';
import Service from './Service';
import {Row} from 'reactstrap'
import './Staff.css';

class Services extends Component {
    render() {
        return (
            <Row>
                {this.props.services.map((service) => {
                    let isFound = false;
                    if (this.props.staff.services) {
                        for (let i = 0; i < this.props.staff.services.length; i++) {
                            if (service.id === this.props.staff.services[i].id)
                                isFound = true;
                        }
                    }
                    return (
                        <Service
                            toggleService={(staff_id, service_id, staff) => this.props.toggleService(staff_id, service_id, staff)}
                            service_id={service.id}
                            staff_id={this.props.staff_id}
                            staff={this.props.staff}
                            key={service.id}
                            name={service.name}
                            active={isFound}/>
                    )
                })}
            </Row>
        );
    }
}

export default Services;
