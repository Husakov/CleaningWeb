import React from 'react';
import {Button, Card, CardBody, CardHeader, Modal, ModalBody, ModalHeader} from "reactstrap";
import './staff/Staff.css';
class AvatarPickerDialog extends React.Component {

    state = {
        pickedIndex: -1,
        url: "",
        file: null
    };

    onSave = () => {
        if (this.state.file == null) {
            this.props.handleFormInput("image", this.state.url);
        } else {
            this.props.handleImage(this.state.file);
        }
        setTimeout(() => this.props.toggle(), 100);
    };

    render() {
        return (
            <Modal isOpen={this.props.isOpen} toggle={this.props.toggle}>
                <ModalHeader toggle={this.props.toggle}/>
                <ModalBody>
                    <Card>
                        <CardHeader>
                            <h4 className="staff-modal-heading">Select an avatar:</h4></CardHeader>
                        <div className="avatars">
                            {this.props.avatars.map((avatar, i) => {
                                return (
                                    <img key={avatar.id}
                                         className={this.state.pickedIndex === i ? "staff-avatar active" : "staff-avatar"}
                                         onClick={() => this.setState({pickedIndex: i, url: avatar.url, file: null})}
                                         src={avatar.url}/>
                                )
                            })}</div>
                    </Card>
                    <h1 className="or-line">OR</h1>
                    <Card>
                        <CardHeader>
                            <h4>Upload an image: </h4>
                        </CardHeader>
                        <CardBody>
                            <input type="file" onChange={(e) => this.setState({file: e.target.files[0]})}
                                   accept="image/*"/>
                        </CardBody>
                    </Card>
                    <Button className="add-user-button avatar" onClick={this.onSave}>Save</Button>
                </ModalBody>
            </Modal>
        )
    }
}

export default AvatarPickerDialog;
