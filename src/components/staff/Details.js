import React, {Component} from 'react';
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Col,
    FormFeedback,
    FormGroup,
    Input,
    InputGroup,
    InputGroupAddon,
    Label,
    Modal,
    ModalBody,
    ModalHeader,
    Row
} from 'reactstrap';
import Toggle from '../Toggle'
import './Staff.css';
import {getError} from "../../util";
import {faCamera} from '@fortawesome/fontawesome-free-solid/shakable.es';
import Icon from '@fortawesome/react-fontawesome'
import noUserImg from '../../user.png';

class StaffDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            preview: props.user.image,
            avatars: [false, false, false, false,
                false, false, false, false]
        }
    }

    toggle() {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }

    selectImage(i) {
        let avatars = [...this.state.avatars];
        avatars[i] = !avatars[i];
        for (let j = 0; j < this.state.avatars.length; j++) {
            if (j === i)
                continue;
            avatars[j] = false;
        }

        this.props.handleFormInput("imageurl", this.props.avatars[i].url);
        this.props.handleFormInput("image", this.props.avatars[i].url);
        this.setState({avatars})
    }

    uploadImage(e) {
        let avatars = [...this.state.avatars];
        for (let j = 0; j < this.state.avatars.length; j++) {
            avatars[j] = false;
        }
        this.setState({avatars});
        this.props.handleImage(e);
    }

    error(name) {
        if (!this.props.errors) return undefined;
        return getError(this.props.errors, name);
    }

    render() {
        return (
            <Row>
                <Modal isOpen={this.state.isOpen} toggle={() => this.toggle()}>
                    <ModalHeader toggle={() => this.toggle()}>Select Avatar</ModalHeader>
                    <ModalBody>
                        <Card>
                            <CardHeader>
                                <h4 className="staff-modal-heading">Select an avatar:</h4></CardHeader>
                            <div className="avatars">
                                {this.props.avatars.map((avatar, i) => {
                                    return (
                                        <img key={avatar.id}
                                             className={this.state.avatars[i] ? "staff-avatar active" : "staff-avatar"}
                                             onClick={() => this.selectImage(i)}
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
                                <input type="file" onChange={(e) => this.uploadImage(e)} accept="image/*"/>
                            </CardBody>
                        </Card>
                        <Button className="add-user-button avatar" onClick={() => this.toggle()}>Save</Button>
                    </ModalBody>
                </Modal>
                <Col md={2} style={{position: "relative"}}>
                    <img src={this.props.user.image ? this.props.user.image : noUserImg}
                         onClick={() => this.setState({isOpen: !this.state.isOpen})}
                         alt="profile"
                         className="details-profile-image"/>
                    <Icon className="staff-camera-icon"
                          icon={faCamera}
                          onClick={() => this.setState({isOpen: !this.state.isOpen})}/>
                </Col>
                <Col md={10}>
                    <Row>
                        <Col md={4}>
                            <Label for="name">Full Name<span style={{color: 'red'}}>*</span></Label>
                        </Col>
                        <Col md={8}>
                            <FormGroup>
                                <Input
                                    type="input"
                                    name="name" id="name"
                                    className="details-input"
                                    placeholder="Full name"
                                    invalid={this.error("name")}
                                    value={this.props.user.name ? this.props.user.name : ""}
                                    onChange={(e) => this.props.handleFormInput('name', e.target.value)}
                                />
                                <FormFeedback>{this.error("name")}</FormFeedback>
                            </FormGroup>
                        </Col>
                        <Col md={4}>
                            <Label for="desc">Description</Label>
                        </Col>
                        <Col md={8}>
                            <FormGroup>
                                <Input
                                    type="textarea"
                                    name="desc"
                                    className="details-input"
                                    value={this.props.user.description ? this.props.user.description : ""}
                                    onChange={(e) => this.props.handleFormInput('description', e.target.value)}/>
                            </FormGroup>
                        </Col>
                        <Col md={4}>
                            <Label for="phone">Phone</Label>
                        </Col>
                        <Col md={8}>
                            <Row>
                                <Col md={12}>
                                    <FormGroup>
                                        <InputGroup>
                                            <InputGroupAddon addonType="prepend">+1</InputGroupAddon>
                                            <Input
                                                type="input"
                                                name="phone"
                                                className="details-input"
                                                invalid={this.error("phone_number")}
                                                value={this.props.user.phone_number ? this.props.user.phone_number : ""}
                                                onChange={(e) => this.props.handleFormInput('phone_number', e.target.value)}/>
                                        </InputGroup>
                                        <FormFeedback>{this.error("phone_number")}</FormFeedback>
                                    </FormGroup>
                                </Col>
                            </Row>
                        </Col>
                        <Col md={4}>
                            <Label for="email">Email</Label>
                        </Col>
                        <Col md={8}>
                            <FormGroup>
                                <Input
                                    type="email"
                                    name="email"
                                    className="details-input"
                                    invalid={this.error("email")}
                                    value={this.props.user.email ? this.props.user.email : ""}
                                    onChange={(e) => this.props.handleFormInput('email', e.target.value)}/>
                                <FormFeedback>{this.error("email")}</FormFeedback>
                            </FormGroup>
                        </Col>
                        <Col md={4}>
                            <Label for="password">Password</Label>
                        </Col>
                        <Col md={8}>
                            <FormGroup>
                                <Input
                                    type="text"
                                    name="password"
                                    className="details-input"
                                    invalid={this.error("password")}
                                    value={this.props.user.password ? this.props.user.password : ""}
                                    onChange={(e) => this.props.handleFormInput('password', e.target.value)}/>
                                <FormFeedback>{this.error("password")}</FormFeedback>
                            </FormGroup>
                        </Col>
                        <Col md={4}>
                            <Label>User Type</Label>
                        </Col>
                        <Col md={8}>
                            <FormGroup>
                                <Input type="select" className="user-type"
                                       onChange={(e) => this.props.handleFormInput('role_id', e.target.value)}
                                       value={this.props.user.role_id ? this.props.user.role_id : "0"}>
                                    {this.props.roles.map((role) => {
                                        return (
                                            <option value={role.id} key={role.id}>{role.name}</option>
                                        )
                                    })}
                                </Input>
                            </FormGroup>
                        </Col>
                        <Col md={4}>
                            <Label>Assign to</Label>
                        </Col>
                        <Col md={8}>
                            <FormGroup>
                                <Input type="select" className="user-type"
                                       value={this.props.user.team_id}
                                       onChange={(e) => {
                                           this.props.handleFormInput('team_id', e.target.value)
                                       }}>
                                    {this.props.teams.map((team) => {
                                        return (
                                            <option value={team.id} key={team.id}>{team.name}</option>
                                        )
                                    })}
                                </Input>
                            </FormGroup>
                        </Col>
                        <Col md={4}>
                            <Label for="Pay Rate">Pay Rate</Label>
                        </Col>
                        <Col md={2}>
                            <Input type="select" className="user-type pay-rate"
                                   onChange={(e) => this.props.handleFormInput('pay_rate_type', e.target.value)}
                                   value={this.props.user.pay_rate_type}>
                                <option value="hourly">Hourly</option>
                                <option value="comission">Commision</option>
                            </Input>
                        </Col>
                        <Col md={6}>
                            <FormGroup>
                                <InputGroup>
                                    <InputGroupAddon addonType="prepend">
                                        {this.props.user.pay_rate_type === "hourly" ? "$" : "%"}
                                    </InputGroupAddon>
                                    <Input
                                        type="text"
                                        name="pay_rate"
                                        className="details-input"
                                        value={this.props.user.pay_rate ? this.props.user.pay_rate : ""}
                                        onChange={(e) => this.props.handleFormInput('pay_rate', e.target.value)}
                                    >
                                    </Input>
                                </InputGroup>
                            </FormGroup>
                        </Col>
                        <Col md={4}>
                            <Label>Status</Label>
                        </Col>
                        <Col md={8}>
                            <Toggle activeText="Active"
                                    inactiveText="Inactive"
                                    onClick={() => {
                                        this.props.handleFormInput("active", !this.props.user.active);
                                    }}
                                    value={this.props.user.active}/>
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}

export default StaffDetails;
