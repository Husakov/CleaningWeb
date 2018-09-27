import React from 'react'
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import CustomerContactPermissionsForm from "../components/customers/CustomerContactPermissionsForm";

class ContactPermissionsDialog extends React.Component {

    toggle = () => {
        this.props.toggle();
    };
    handleInput = (prop, value) => {
        const permissions = this.state.permissions;
        const permission = permissions.find(p => p.id == prop);
        permission.enabled = value;
        this.setState({permissions});
    };

    constructor(props) {
        super(props);
        this.state = {
            permissions: props.permissions.map(perm => ({...perm}))
        }
    }

    componentDidUpdate(oldProps) {
        if (oldProps.isOpen && !this.props.isOpen) {
            this.setState({permissions: this.props.permissions.map(perm => ({...perm}))})
        }
    }

    render() {
        const permissions = this.state.permissions;
        return (
            <Modal isOpen={this.props.isOpen} toggle={this.toggle}>
                <ModalHeader toggle={this.toggle}>Edit Contact Permissions</ModalHeader>
                <ModalBody>
                    <CustomerContactPermissionsForm permissions={permissions}
                                                    handleInput={this.handleInput}/>
                </ModalBody>
                <ModalFooter>
                    <Button color="success" onClick={() => this.props.savePermissions(permissions)}>Save</Button>
                    <Button color="secondary" onClick={this.toggle}>Cancel</Button>
                </ModalFooter>
            </Modal>
        )
    }
}

export default ContactPermissionsDialog;
