import React from 'react';
import {Modal, ModalBody, ModalHeader} from "reactstrap";
import ReactTable from 'react-table';

const header = (Header, accessor) => ({Header, accessor});

class CustomerListDialog extends React.Component {
    headers = [
        {
            ...header("", "id"),
            Cell: data => <input type="checkbox" checked={this.props.checked[data.original.id] !== true}
                                 onChange={() => this.props.selectCustomer(data.original.id)}/>,
            width: 50
        },
        {
            ...header("Client Name", "name"),
            Cell: data => `${data.original.first_name} ${data.original.last_name}`
        },
        header("E-Mail Address", "email"),
        header("City", "city")
    ];

    render() {
        return (
            <Modal isOpen={this.props.isOpen} toggle={this.props.toggle} size="lg">
                <ModalHeader toggle={this.props.toggle}>
                    Filtered Customer List
                </ModalHeader>
                <ModalBody className="p-0">
                    <ReactTable data={this.props.customers}
                                className="-striped"
                                columns={this.headers} style={{height: "80vh"}}/>
                </ModalBody>
            </Modal>
        )
    }
}

export default CustomerListDialog;
