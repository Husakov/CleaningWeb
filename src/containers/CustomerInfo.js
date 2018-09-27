import React from 'react'
import {Container, Row} from "reactstrap";
import {customer as customerapi, property as propertyapi} from '../api'
import CustomerSidebar from "../components/customers/CustomerSidebar";
import CustomerDetails from "../components/customers/CustomerDetails";
import {connect} from "react-redux";

class CustomerInfo extends React.Component {

    state = {
        customer: undefined,
        permissions: undefined
    };
    savePermissions = async (permissions) => {
        const newPermissions = await customerapi.savePermissions(this.state.customer, permissions);
        this.setState({newPermissions: permissions});
        return newPermissions;
    };
    saveProperty = async (property) => {
        const customer = this.state.customer;
        const propertyApi = propertyapi(this.state.customer.id);
        const response = await (property.id === -1 ? propertyApi.create(property) : propertyApi.update(property.id, property));
        const idx = customer.properties.findIndex(p => p.id === response.id);
        if (idx === -1) {
            customer.properties = [...customer.properties, response]
        } else {
            customer.properties = [...customer.properties];
            customer.properties.splice(idx, 1, response);
        }
        return response;
    };
    removeProperty = async (property) => {
        const customer = this.state.customer;
        const propertyApi = propertyapi(this.state.customer.id);
        const response = await propertyApi.delete(property.id);
        const idx = customer.properties.findIndex(p => p.id === response.id);
        customer.properties = [...customer.properties];
        customer.properties.splice(idx, 1);
        return response;
    };

    async componentDidMount() {
        const customer = await customerapi.get(this.props.match.params.id);
        const permissions = await customerapi.getPermissions(customer);
        this.setState({customer, permissions});

    }

    componentWillUnmount() {
        this.setState({customer: undefined, permissions: undefined})
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.match.params.id !== nextProps.match.params.id || this.props.creating === true && nextProps.creating === false) {
            // noinspection JSIgnoredPromiseFromCall
            this.componentDidMount()
        }
    }

    render() {
        const {customer, permissions} = this.state;
        if (customer === undefined || permissions === undefined) return null;
        return (
            <Container fluid>
                <Row>
                    <CustomerDetails customer={customer}
                                     permissions={permissions}
                                     savePermissions={this.savePermissions}
                                     saveProperty={this.saveProperty}
                                     removeProperty={this.removeProperty}/>
                    <CustomerSidebar customer={customer}/>
                </Row>
            </Container>
        )
    }
}

function mapState(state) {
    return {
        creating: state.customer.creating,
    }
}

export default connect(mapState)(CustomerInfo);
