import React, {Component} from 'react';
import {Modal, ModalBody, ModalHeader, ModalFooter, Button} from "reactstrap";


class AlertDialog extends Component{
    render(){
        return(
            <Modal isOpen={this.props.isOpen} toggle={this.props.toggleModal} size="sm">
                <ModalHeader toggle={this.props.toggleModal}>
                    {this.props.event.blockoff?"Block Time":"Appointment"} Edit
                </ModalHeader>
                <ModalBody>
                    Are you sure you want to change the staff of this {this.props.event.blockoff?"blocktime":"appointment"}?
                </ModalBody>
                <ModalFooter className="d-flex">
                    <Button color="success" onClick={()=>this.props.editEvent(this.props.event, this.props.appt)}>Yes</Button>
                    <Button color="danger">No</Button>
                </ModalFooter>
            </Modal>
        )
    }
}

export default AlertDialog;