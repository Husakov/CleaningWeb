import React from 'react';
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap';

const DeleteModal = ({
                         deleteModal,
                         toggle,
                         deleteOffTime,
                     }) => {
    return (
        <div>
            <Modal isOpen={deleteModal} toggle={toggle}>
                <ModalHeader toggle={toggle}>Delete Off Time</ModalHeader>
                <ModalBody>
                    Are you sure you want to delete this off time?
                </ModalBody>
                <ModalFooter>
                    <Button color="danger" onClick={deleteOffTime}>Delete</Button>{' '}
                    <Button color="secondary" onClick={toggle}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};
export default DeleteModal;
