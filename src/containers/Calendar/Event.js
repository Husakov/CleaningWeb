import React, { Component, Fragment } from "react";
import { DropTarget } from "react-dnd";
import { ButtonGroup, Button, Col, Popover, PopoverBody, PopoverHeader, Row, Tooltip, Alert } from 'reactstrap';
import Icon from '@fortawesome/react-fontawesome'
import {
    faBan,
    faCheck,
    faClock,
    faServer,
    faHome,
    faPencilAlt,
    faPhone,
    faRedo,
    faExclamation,
    faThumbsDown,
    faTrash,
    faCalendarTimes,
    faMapMarkerAlt,
    faEnvelope, faUser, faUsers, faSync
} from "@fortawesome/fontawesome-free-solid/shakable.es";
import BookingDialog from "./BookingDialog";
import AppointmentModel from "../../model/appointment";
import BlockOffModel from "../../model/blockoff";
import CustomerModel from '../../model/customer';
import classnames from 'classnames';
import moment from "moment";
import { appointment as appointmentapi } from '../../api';
import { bindActionCreators } from "redux";
import { connect } from 'react-redux';
import { getCustomers } from '../../reducers/quotesReducer';
import { deleteAppointment, deleteBlockoff, sendMessage, generateQuote, clearErrors } from '../../reducers/calendarReducer';
import AddressDialog from '../../components/AddressDialog';
import MailTextDialog from '../../components/MailTextDialog';
import CreateCustomerDialog from '../CreateCustomerDialog';
import { Link } from "react-router-dom";
import { toast } from 'react-toastify';
import { mailTemplate, smsTemplate } from '../../api';
import classset from 'react-classset';
import { findDOMNode } from 'react-dom';

const target = {
    
    hover(props, monitor, component) {
        // This is fired very often and lets you perform side effects
        // in response to the hover. You can't handle enter and leave
        // here—if you need them, put monitor.isOver() into collect() so you
        // can just use componentWillReceiveProps() to handle enter/leave.

        // You can access the coordinates if you need them
        const clientOffset = monitor.getClientOffset();

        const componentRect = findDOMNode(component).getBoundingClientRect();

        // You can check whether we're over a nested drop target
        const isJustOverThisOne = monitor.isOver({ shallow: true });
        console.log(isJustOverThisOne);

        // You will receive hover() even for items for which canDrop() is false
        const canDrop = monitor.canDrop();
    },
    drop(props, monitor, component) {
        if (monitor.didDrop()) {
            // If you want, you can check whether some nested
            // target already handled drop
            return;
        }

        // Obtain the dragged item
        const item = monitor.getItem();

        // You can do something with it
        
        
        // You can also do nothing and return a drop result,
        // which will be available as monitor.getDropResult()
        // in the drag source's endDrag() method
        return;
    }
};

const collect = (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    canDrop: monitor.canDrop(),
    isOver: monitor.isOver(),
    isOverCurrent: monitor.isOver({ shallow: true }),
});


class Event extends Component {
    state = {
        isOpen: false,
        model: false,
        isAddressOpen: false,
        isMailOpen: false,
        isCustomerOpen: false,
        appointment: new AppointmentModel(),
        confirmed: false,
        unconfirmed: false,
        noshow: false,
        cancelled: false,
        recurring: false,
        mailTooltip: false,
        deletePopover: false,
        address: "",
        quote_url: "",
        tags: [],
        customer: this.props.event.customer
    };

    componentWillReceiveProps(newProps) {
        if (this.props.creatingCustomer && !newProps.creatingCustomer && this.props.event.customer) {
            const customer = newProps.customers.find(cst => cst.id === this.props.event.customer.id);
            this.setState({ customer });
        }
    }
    toggleModal = async (event) => {
        if (!event || !event.id)
            event = null;
        let appointment = {};
        if (!this.state.modal && this.props.event.blockoff !== true) {
            appointment = await appointmentapi(this.props.user.selectedCompany.id).get(this.props.event.id);
            appointment.repeat_id = this.props.event.repeat_id;
        }
        this.props.clearErrors();
        this.setState({
            modal: !this.state.modal,
            isOpen: false,
            appointment: new AppointmentModel(appointment),
            blockoff: new BlockOffModel(this.props.event)
        });
    };
    toggleAddressModal = (address = "") => {
        this.setState({ isOpen: false, isAddressOpen: !this.state.isAddressOpen, address });
    }
    toggleMailModal = async () => {
        let tags = [];
        if (!this.state.tags.length > 0)
            tags = await mailTemplate(this.props.user.companies[0].id).tags();
        this.props.getCustomers(this.props.user.selectedCompany.id);
        this.setState({ isOpen: false, isMailOpen: !this.state.isMailOpen, tags });
    }
    toggleCustomerModal = () => {
        this.setState({ isOpen: false, isCustomerOpen: !this.state.isCustomerOpen });
    }
    toggle = () => {
        this.setState({
            tooltip: !this.state.tooltip
        })
    };
    getEventColor = () => {
        if (this.props.event.blockoff)
            return this.props.event.color;
        if (this.props.event.offtime)
            return "black";
        else {
            switch (this.props.event.status) {
                case "Confirmed": {
                    let color = this.props.event.appointment_services[0].service ? this.props.event.appointment_services[0].service.color : "";
                    let hexString = color.toString(16);
                    const strLen = 6 - hexString.length;
                    for (let i = 0; i < strLen; i++) {
                        hexString = "0" + hexString;
                    }
                    hexString = "#" + hexString;
                    return this.props.event.appointment_services[0].service ? hexString : "rgb(158, 216, 108)";
                }
                case "Unconfirmed": return "#ff8c00";
                case "Cancelled": return "red";
                case "No-Show": return "gray";
            }
        }
    }
    cancelAppointment = () => {
        const appt = { ...this.props.event };
        delete appt.appointment_services;
        appt.status = 'Cancelled';
        this.props.editAppointment(this.props.user.selectedCompany.id, { status: "Cancelled" }, appt.id)
    }
    delete = () => {
        this.setState({ isOpen: false }, () => {
            if (this.props.event.blockoff)
                this.props.deleteBlockoff(this.props.user.selectedCompany.id, this.props.event.id);
            else
                this.props.deleteAppointment(this.props.user.selectedCompany.id, this.props.event.id);
        })
    };
    generateQuote = () => {
        this.props.generateQuote(this.props.user.selectedCompany.id, this.props.event.id);
    }
    viewQuote = () => {
        const win = window.open(this.props.url, '_blank');
        win.focus();
    }
    viewInvoice = () => {
        if (this.props.event.invoice) {
            const win = window.open(this.props.event.invoice.url, '_blank');
            win.focus();
        }
        else
            toast.error("No invoice found");
    }
    render() {
        const { event, connectDropTarget, canDrop, isOver, isOverCurrent } = this.props;
        console.log(isOverCurrent);
        return connectDropTarget(
            <div
                className="calendar-event"
                onClick={() => {
                    //popover is opening by id, reccuring events cant be edited/canceled
                    this.setState({ isOpen: !this.state.isOpen })
                }}

                id={`${event.blockoff ? "block" : "appt"}${event.repeat_id ? event.repeat_id : event.id}`}
                style={{ background: this.getEventColor(), height: "108px" }}
                className={classnames({
                    "container-fluid px-0 pt-2 calendar-event h-100": true,
                    "calendar-event-background": true,
                    "confirmed": event.status === "Confirmed" || event.blockoff,
                    "pending": true,
                })}>
                <Row className="p-1 mx-0 align-items-start">
                    {event.customer_id && !event.blockoff &&
                        <div className="w-100" style={{ maxHeight: '100px' }}>
                            <Col className="p-0 d-flex" xs={12}>
                                {event.repeating &&
                                    <Fragment>
                                        <Icon className="mb-2 text-right" id={"recurring" + event.repeat_id} icon={faRedo} />
                                        <Tooltip placement="top" isOpen={this.state.recurring} target={"recurring" + event.repeat_id}
                                            toggle={() => { this.setState({ recurring: !this.state.recurring }) }}>
                                            Recurring Appointment
                                    </Tooltip>
                                    </Fragment>}
                                {event.status === "Confirmed" &&
                                    <Fragment>
                                        <Icon className={classset({ "mb-2 text-right": true, "ml-2": event.repeating })} id={"confirmed" + (event.repeat_id ? event.repeat_id : event.id)} icon={faCheck} />
                                        <Tooltip placement="top" isOpen={this.state.confirmed} target={"confirmed" + (event.repeat_id ? event.repeat_id : event.id)}
                                            toggle={() => { this.setState({ confirmed: !this.state.confirmed }) }}>
                                            Confirmed
                                    </Tooltip>
                                    </Fragment>}
                                {event.status === "Unconfirmed" &&
                                    <Fragment>
                                        <Icon className={classset({ "mb-2 text-right": true, "ml-2": event.recurring })} id={"pending" + (event.repeat_id ? event.repeat_id : event.id)} icon={faExclamation} />
                                        <Tooltip placement="top" isOpen={this.state.unconfirmed} target={"pending" + (event.repeat_id ? event.repeat_id : event.id)}
                                            toggle={() => { this.setState({ unconfirmed: !this.state.unconfirmed }) }}>
                                            Unconfirmed
                                    </Tooltip>
                                    </Fragment>}
                                {event.status === "Cancelled" &&
                                    <Fragment>
                                        <Icon className={classset({ "mb-2 text-right": true, "ml-2": event.recurring })} id={"cancel" + (event.repeat_id ? event.repeat_id : event.id)} icon={faBan} />
                                        <Tooltip placement="top" isOpen={this.state.cancelled} target={"cancel" + (event.repeat_id ? event.repeat_id : event.id)}
                                            toggle={() => { this.setState({ cancelled: !this.state.cancelled }) }}>
                                            Cancelled
                                    </Tooltip>
                                    </Fragment>}
                                {event.status === "No-Show" &&
                                    <Fragment>
                                        <Icon className={classset({ "mb-2 text-right": true, "ml-2": event.recurring })} id={"noshow" + (event.repeat_id ? event.repeat_id : event.id)}
                                            icon={faThumbsDown} />
                                        <Tooltip placement="top" isOpen={this.state.noshow}
                                            target={"noshow" + (event.repeat_id ? event.repeat_id : event.id)}
                                            toggle={() => { this.setState({ noshow: !this.state.noshow }) }}>
                                            No-Show
                                    </Tooltip>
                                    </Fragment>}
                            </Col>
                            <Row className="container-fluid m-0 p-0">
                                <Col className="p-0" xs={8}><p
                                    className="mb-0 appointment-detail">{`${this.state.customer && this.state.customer.first_name} ${this.state.customer && this.state.customer.last_name}`}</p></Col>
                                <Col className="p-0" xs={4}><p className="mb-1 text-right appointment-detail">{event.duration}min</p></Col>
                                <Col className="p-0" xs={8}><p className="mb-1 appointment-detail">{event.address}</p></Col>
                                <Col className="p-0" xs={4}><p className="mb-1 text-right appointment-detail">${Number((event.total) / 100)}</p></Col>
                                <Col className="p-0" xs={8}><p className="mb-1 appointment-detail">+1{this.state.customer && this.state.customer.phone_number}</p></Col>
                            </Row>
                        </div>
                    }
                    {event.blockoff && <Col className="p-0" xs={12}>{event.recurring &&
                        <Col className="p-0" xs={12}>
                            <Fragment>
                                <Icon className="mb-2 ml-2 text-right" id={"recurring" + event.repeat_id} icon={faRedo} />
                                <Tooltip placement="top" isOpen={this.state.recurring} target={"recurring" + event.repeat_id}
                                    toggle={() => { this.setState({ recurring: !this.state.recurring }) }}>
                                    Recurring Block Time
                                </Tooltip>
                            </Fragment></Col>}
                        <Row className="container-fluid m-0 p-0">
                            <Col className="p-0" xs={12}><p className="mb-0">{event.note ? event.note : "Block Time"}</p></Col>
                            <Col xs={12} />
                            <Col xs={12} />
                        </Row>
                    </Col>
                    }
                    {event.offtime &&
                        <Col className="p-0" xs={12}>
                            <Col className="p-0" xs={12}>
                                <Fragment>
                                    <Icon style={{ color: "white" }} className="mb-2 ml-2 text-right" id={"offtime" + event.id} icon={faCalendarTimes} />
                                    <Tooltip placement="top" isOpen={this.state.recurring} target={"offtime" + event.id}
                                        toggle={() => { this.setState({ recurring: !this.state.recurring }) }}>
                                        User Off time
                                </Tooltip>
                                </Fragment></Col>
                            <Col className="p-0" xs={12}><p
                                className="mb-0">{""}</p></Col>
                            <Col className="p-0" xs={12}><p
                                style={{ color: "white" }}
                                className="mb-0">{event.user.name}</p></Col>
                            <Col className="p-0" xs={12}><p
                                style={{ color: "white" }}
                                className="mb-0">{event.note > 0 ? event.note : ""}</p></Col>
                        </Col>}
                </Row>
                {!event.offtime && <Popover
                    className="big"
                    placement="right" isOpen={this.state.isOpen}
                    toggle={() => this.setState({ isOpen: false, deletePopover: false })}
                    target={`${event.blockoff ? "block" : "appt"}${event.repeat_id ? event.repeat_id : event.id}`}>
                    <PopoverHeader>
                        {event.customer && !event.blockoff &&
                            <Col className="p-0" md={12}>
                                <Link to={`/dashboard/customer/${event.customer.id}`}>{`${this.state.customer && this.state.customer.first_name} ${this.state.customer && this.state.customer.last_name}`}</Link>
                                <Icon onClick={() => this.toggleCustomerModal()} id={"mail" + (event.repeat_id ? event.repeat_id : event.id)} className="send-mail-icon" icon={faPencilAlt} />
                                <Icon onClick={() => this.toggleMailModal()} id={"mail" + (event.repeat_id ? event.repeat_id : event.id)} className="send-mail-icon" icon={faEnvelope} />
                            </Col>}
                    </PopoverHeader>

                    <PopoverBody>
                        {event.note && event.note.length > 0 && <Alert color="warning">{event.note}</Alert>}
                        {event.customer && !event.blockoff &&
                            <React.Fragment>
                                <Col className="p-0"><Icon icon={faPhone} className="mr-1" />{`+1${this.state.customer && this.state.customer.phone_number}`}</Col>

                                <Col className="p-0" md={12}>
                                    <Icon icon={faHome} className="mr-1" />
                                    {event.address}
                                    <Button onClick={() => this.toggleAddressModal(event.address)} style={{ fontSize: "14px" }} className="pt-0" color="link"><Icon className="mr-1" icon={faMapMarkerAlt} />Map</Button>
                                </Col>

                                <Col className="p-0" md={12}><Icon className="mr-1" icon={faServer} />${Number(event.total) / 100}</Col></React.Fragment>}

                        <Col className="p-0" md={12}><Icon icon={faClock} className="mr-1" />{`${moment(event.start_time).format("HH:mm A")}-${moment(event.end_time).format("HH:mm A")}`}</Col>
                        <Col className="p-0" md={12}><Icon icon={event.team_id ? faUsers : faUser} className="mr-1" />{event.team_id && event.team_id !== -1 ? this.props.staff.find(staff => staff.id === event.team_id).name
                            : this.props.staff[this.props.staff.length - 1].users.find(user => user.id === event.staff_id).name}</Col>
                        {!event.blockoff && <Col md={12} className="p-0 mt-2 d-flex justify-content-center">
                            <ButtonGroup className="w-100">
                                <Button className="w-100" disabled={this.props.generatingQuote}
                                    onClick={() => event.quote ? this.viewQuote() : this.generateQuote()} color="info">
                                    {(this.props.generatingQuote && <Icon spin icon={faSync} />)} {event.quote ? "View Quote" : "Generate Quote"}</Button>
                                <Button onClick={() => this.viewInvoice()} className="w-100" color="info">View Invoice</Button>
                            </ButtonGroup>
                        </Col>}
                        <Col className="p-0 mt-2 d-flex justify-content-between" md={12}>
                            <Button color="primary" onClick={this.toggleModal}><Icon icon={faPencilAlt} /> Edit</Button>
                            <Button color="danger" id="delete-appt" className="ml-2" onClick={() => this.setState({ deletePopover: true })}><Icon icon={faTrash} /> Cancel</Button>
                        </Col>
                    </PopoverBody>
                    {/*delete promt*/}
                    <Popover
                        className="delete-event-pop"
                        container="inline"
                        placement="top"
                        target="delete-appt"
                        isOpen={this.state.deletePopover}
                        toggle={() => this.setState({
                            deletePopover: !this.state.deletePopover
                        })}>
                        <PopoverHeader>Delete this Appointment?</PopoverHeader>
                        <PopoverBody className="d-flex justify-content-between">
                            <Button color="danger"
                                onClick={() => this.delete()}>
                                Yes
                                    </Button>
                            <Button color="secondary"
                                onClick={() => this.setState({
                                    deletePopover: !this.state.deletePopover
                                })}
                            >
                                Cancel
                            </Button>
                        </PopoverBody>
                    </Popover>
                </Popover>}
                <div className={classnames({
                    "calendar-event-drop-target": true,
                    "active": false
                })}>Drop Staff Here
                </div>
                <BookingDialog
                    isOpen={this.state.modal}
                    toggleModal={this.toggleModal}
                    type={event.blockoff !== undefined ? "off-time" : "manual"}
                    closeModal={() => this.setState({ modal: false })}
                    blockoff={event}
                    appointment={this.state.appointment} />
                {this.state.isAddressOpen && <AddressDialog
                    address={this.state.address}
                    toggle={() => this.toggleAddressModal()}
                    isOpen={this.state.isAddressOpen} />}
                {this.state.isMailOpen &&
                    <MailTextDialog
                        sendMessage={this.props.sendMessage}
                        sendingMessage={this.props.sendingMessage}
                        close={() => this.setState({ isMailOpen: false })}
                        customer={event.customer ? this.state.customer : { id: -1 }}
                        customers={this.props.quoteCustomers}
                        quote={event.quote}
                        appointmentId={event.id}
                        errors={this.props.errors}
                        selectedCompanyId={this.props.user.selectedCompany.id}
                        tags={this.state.tags}
                        toggle={() => this.toggleMailModal()}
                        isOpen={this.state.isMailOpen} />}
                {this.state.isCustomerOpen && <CreateCustomerDialog
                    isOpen={this.state.isCustomerOpen}
                    toggle={() => this.toggleCustomerModal()}
                    customer={new CustomerModel(this.state.customer)}
                />}
            </div>
        )
    }
}

const mapState = state => ({
    user: state.user,
    staff: state.staff.staff,
    customers: state.customer.data.customers,
    quoteCustomers: state.quotes.customers,
    creatingCustomer: state.customer.creating,
    sendingMessage: state.calendar.sendingMessage,
    generatingQuote: state.calendar.generatingQuote,
    errors: state.calendar.messageErrors
});
const mapActions = dispatch => (bindActionCreators({
    deleteAppointment,
    deleteBlockoff,
    sendMessage,
    generateQuote,
    getCustomers,
    clearErrors
}, dispatch));

export default DropTarget("staff", target, collect)(connect(mapState, mapActions)(Event));

