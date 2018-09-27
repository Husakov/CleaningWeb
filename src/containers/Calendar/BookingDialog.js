import React from 'react';
import {Button, Col, Modal, ModalBody, ModalHeader, Row,} from "reactstrap";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import moment from "moment/moment";
import AppointmentModel from '../../model/appointment';
import BlockOffModel from '../../model/blockoff';
import ManualBooking from './ManualBooking';
import Blockoff from './Blockoff';
import './BookingDialog.css';


class BookingDialog extends React.Component {

    state = {
        //datepicker state
        appointment: new AppointmentModel(this.props.start_time),
        blockoff: new BlockOffModel(this.props.start_time, this.props.end_time),
        addressList: [],
        type: this.props.type ? this.props.type : "manual",
        repeat: {
            active: false,
            amount: 1,
            mode: "w",
            repeatOn: "days",
            end_time: moment(`${moment().format('YYYY')}-12-31 11:45 PM `),
        },
        depositEnabled: false,
        actionsOpen: false
    };

    render() {
        return (
            <Modal size='lg' isOpen={this.props.isOpen} toggle={this.props.toggleModal}>
                <ModalHeader
                    toggle={this.props.toggleModal}>{this.props.appointment.id !== -1 ? (this.state.type === "off-time" ? "Edit Blockoff" : "Edit Appointment") :
                    (this.state.type === "off-time" ? "Create Blockoff" : "Create Appointment")}</ModalHeader>
                <ModalBody>
                    <Row>
                        <Col md={12} xs={12}>
                            {this.props.appointment && this.props.appointment.id < 0 &&
                            <div className="booking-buttons d-flex justify-content-between">
                                <Button color={this.state.type === "manual" ? "primary" : "default"}
                                        onClick={() => this.setState({type: "manual"})}
                                >Manual Booking</Button>
                                <Button style={{marginLeft: "20px"}}
                                        onClick={() => this.setState({type: "off-time"})}
                                        color={this.state.type !== "manual" ? "primary" : "default"}>Create Time
                                    Block</Button>
                            </div>}
                            {this.state.type === "manual" &&
                            <ManualBooking
                                closeModal={this.props.closeModal}
                                appointment={this.props.appointment}
                                team_id={this.props.team_id}
                                staff_id={this.props.staff_id}
                                start_time={this.props.start_time}/>}
                            {this.state.type === "off-time" &&
                            <Blockoff blockoff={this.props.blockoff} 
                            closeModal={this.props.closeModal}
                            team_id={this.props.team_id}
                            staff_id={this.props.staff_id}
                            start_time={this.props.start_time} end_time={this.props.end_time}/>}
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>
        )
    }
}

function mapState(state) {
    return {}
}

function mapDispatch(dispatch) {
    return bindActionCreators({}, dispatch)
}

export default connect(mapState, mapDispatch)(BookingDialog);
