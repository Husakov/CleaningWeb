import React, { Component } from "react";
import "./Calendar.css";
import BigCalendar from "@kemoke/react-big-calendar";
import moment from "moment";
import { Col, Container, Row } from 'reactstrap';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-datepicker/dist/react-datepicker-cssmodules.css';
import "@kemoke/react-big-calendar/lib/css/react-big-calendar.css";
import withDragAndDrop from "@kemoke/react-big-calendar/lib/addons/dragAndDrop";
import "@kemoke/react-big-calendar/lib/addons/dragAndDrop/styles.css";
import withDragDropContext from "../../dnd-context";
import BookingDialog from "./BookingDialog";
import AlertDialog from "./AlertDialog";
import StaffList from "../../components/Calendar/StaffList";
import JobList from "../../components/Calendar/JobList";
import { bindActionCreators } from "redux";
import { addEvent, loadEvents, removeQuote, replaceEvent, setEvents, editAppointment, editBlockoff, clearErrors } from "../../reducers/calendarReducer";
import { getList } from '../../reducers/serviceReducer';
import { connect } from 'react-redux';
import { appointment, quotes } from "../../api";
import AppointmentModel from "../../model/appointment";
import BlockOffModel from "../../model/blockoff";
import Event from './Event';
import Toolbar from "../../components/Calendar/Toolbar";
import { getStaff } from "../../reducers/staffReducer";
import { colorLuminance } from "../../util";
import { getCustomers } from '../../reducers/quotesReducer';
import { toast } from "react-toastify";

const DragAndDropCalendar = withDragAndDrop(BigCalendar, { backend: false });

BigCalendar.setLocalizer(BigCalendar.momentLocalizer(moment));


class Calendar extends Component {
    toggleModal = (event) => {
        this.setState({
            modal: !this.state.modal,
            appointment: new AppointmentModel(event)
        });
    };
    closeModal = () => {
        this.setState({
            modal: false,
        });
    };
    toggleAlertModal = (event = {}, appt = {}) => {
        this.setState({ alertModal: !this.state.alertModal, event, appt })
    }
    closeAlertModal = () => {
        this.setState({ alertModal: false })
    }
    handleChange = (date) => {
        this.setState({
            startDate: date
        });
    };
    calculateDuration = (services) => {
        let duration = 0;
        services.forEach(service => {
            service.service_pricings.forEach(pricing => {
                let rules = [];
                //so we find pricing rules from original services
                const serviceIndex = this.props.services.findIndex(srv => srv.id === service.service_id);
                const pricingIndex = this.props.services[serviceIndex].pricings.findIndex(prc => prc.id === pricing.id);
                rules = this.props.services[serviceIndex].pricings[pricingIndex].rules;
                rules.forEach((rule) => {
                    if (pricing.pivot.quantity >= rule.from && pricing.pivot.quantity <= rule.to)
                        duration += rule.duration;
                })
            });
            service.add_ons.forEach(add_on => {
                let rules = [];
                //so we find pricing rules from original services
                const serviceIndex = this.props.services.findIndex(srv => srv.id === service.service_id);
                const addonIndex = this.props.services[serviceIndex].addons.findIndex(adn => adn.id === add_on.id);
                rules = this.props.services[serviceIndex].addons[addonIndex].rules;
                rules.forEach((rule) => {
                    if (add_on.pivot.quantity >= rule.from && add_on.pivot.quantity <= rule.to)
                        duration += rule.duration;
                })
            })
        });
        return duration;
    }

    createFromQuote = async (team_id, event, start, end) => {
        const quote = await quotes.getQuote(this.props.user.selectedCompany.id, event.quote.quote_id);
        const duration = this.calculateDuration(quote.appointment.appointment_services);
        start = moment(start).toDate();
        end = moment(start).add(duration, "minutes").toDate();
        const appt = await appointment(this.props.user.selectedCompany.id).createFromQuote(quote.id, start, end, team_id, duration);
        this.props.addEvent(appt);
        this.props.removeQuote(quote.id);
    }
    moveEvent = (team_id) => ({ event, start, end }) => {
        if (!event.id)
            this.createFromQuote(team_id, event, start, end);
        else {
            let appt;
            appt = { start_time: moment(start).format('YYYY-MM-DD hh:mm A'), end_time: moment(end).format('YYYY-MM-DD hh:mm A'), team_id };
            if (event.repeating) {
                toast.warn("Repeating appointments cannot be edited!");
                return;
            }
            if (team_id !== event.team_id) {
                //event for getting the id and type of appt in modal
                //appt for editing the event
                this.toggleAlertModal(event, appt);
                return;
            }
            this.editEvent(event, appt);
        }
    };
    moveEventStaff = (staff_id) => ({ event, start, end }) => {
        if (!event.id) {
            const quote = event.quote;
            start = moment(start).toDate();
            end = moment(start).add(120, "minutes").toDate();
            event = { ...quote, id: quote.appointment_id, start, end, staff_id };
            this.props.addEvent(event);
            this.props.removeQuote(quote.id);
            appointment(this.props.user.selectedCompany.id).createFromQuote(quote.id, start, end, staff_id)
        } else {
            let appt;
            appt = { start_time: moment(start).format('YYYY-MM-DD hh:mm A'), end_time: moment(end).format('YYYY-MM-DD hh:mm A'), staff_id };
            if (event.repeating) {
                toast.warn("Repeating appointments cannot be edited!");
                return;
            }
            if (staff_id !== event.staff_id) {
                //event for getting the id and type of appt in modal
                //appt for editing the event
                this.toggleAlertModal(event, appt);
                return;
            }
            this.editEvent(event, appt);
        }
    };
    editEvent(event, appt) {
        if (event.blockoff)
            this.props.editBlockoff(this.props.user.selectedCompany.id, appt, event.id);
        if (!event.offtime && !event.blockoff)
            this.props.editAppointment(this.props.user.selectedCompany.id, appt, event.id);
        this.closeAlertModal();
    }
    resizeEvent = (team_id) => (resizeType, { event, start, end }) => {
        const { events } = this.props;
        let appt = { start_time: moment(start).format('YYYY-MM-DD hh:mm A'), end_time: moment(end).format('YYYY-MM-DD hh:mm A') };
        const duration = moment.duration(moment(appt.end_time).diff(moment(appt.start_time)));
        appt.duration = Number(duration.asMinutes());
        const isSame = moment(event.start_time).isSame(moment(appt.end_time), "day");
        if (isSame) {
            if (event.blockoff)
                this.props.editBlockoff(this.props.user.selectedCompany.id, appt, event.id);
            else
                this.props.editAppointment(this.props.user.selectedCompany.id, appt, event.id);
        }
    };
    onSelectSlot = (slotInfo, team_id, staff_id) => {
        let appointment = { ...this.state.appointment };
        appointment.start_time = slotInfo;
        this.setState({
            selectedSlotTime: slotInfo, selectedSlotHours: moment(slotInfo.start).hours(),
            selectedSlotMin: moment(slotInfo).minutes(),
            team_id, staff_id,
            appointment
        }, () => {
            this.props.clearErrors();
            this.toggleModal(null);
        });
    };
    handleTimeInput = (field, value) => {
        let time;
        if (field === "hour") {
            time += value * 60;
        } else {
            time = this.props.service.duration - time;
            time += Number(value);
        }
    };
    modalSubmit = () => {
        this.props.addEvent({});
        this.toggleModal();
    };
    onNavigate = (date, type) => {
        const companyID = this.props.user.selectedCompany.id;
        const typee = type === "agenda" ? "month" : type;
        this.props.loadEvents(companyID, moment(date).startOf(type).toISOString(), moment(date).endOf(typee).toISOString());
        this.setState({
            startDate: moment(date)
        });
    };
    viewChange = (view) => {
        this.setState({ view });
    };
    sidebarToggle = () => this.setState({ sidebarOpen: !this.state.sidebarOpen });

    constructor(props) {
        super(props);
        this.state = {
            //calendar view
            view: 'day',
            calendarDate: moment(),
            startDate: moment(),
            selectedSlotTime: { start: moment() },
            appointment: new AppointmentModel(),
            blockoff: new BlockOffModel(),
            isOpen: false,
            toolbar: {},
            sidebarOpen: false,
            selectedTeams: [],
            selectedStaff: [],
            modal: false,
            alertModal: false,
            //for selecting staff in the form
            team_id: -1,
            staff_id: -1,
            //edit with d&d
            event: {},
            appt: {}
        };
        this.moveEvent = this
            .moveEvent
            .bind(this);
    }

    componentDidMount() {
        this.props.loadEvents(this.props.user.selectedCompany.id, moment().startOf("day").toISOString(), moment().endOf("day").toISOString());
        this.props.getServices(this.props.user.selectedCompany.id);
        this.props.getCustomers(this.props.user.selectedCompany.id);
        this.props.getStaff(this.props.user.selectedCompany.id).then(res => {
            this.setState({ selectedTeams: ["all", ...this.props.teams.map(t => t.id)] })
        });
    }

    selectedTeamsChanged = (value) => {
        if (value.filter(v => v.value === "all")[0] && !this.state.selectedTeams.filter(v => v === "all")[0]) {
            this.setState({ selectedTeams: ["all", ...this.props.teams.map(t => t.id)] })
        } else if (!value.filter(v => v.value === "all")[0] && this.state.selectedTeams.filter(v => v === "all")[0]) {
            this.setState({ selectedTeams: [] });
        } else {
            const idxAll = value.filter(v => v.value === "all")[0];
            if (idxAll) {
                value.splice(idxAll, 1);
            }
            this.setState({ selectedTeams: value.map(v => v.value) })
        }
    };

    selectedStaffChanged = (value) => {
        if (value.filter(v => v.value === "all")[0] && !this.state.selectedStaff.filter(v => v === "all")[0]) {
            this.setState({ selectedStaff: ["all", ...this.props.staff.map(t => t.id)] })
        } else if (!value.filter(v => v.value === "all")[0] && this.state.selectedStaff.filter(v => v === "all")[0]) {
            this.setState({ selectedStaff: [] });
        } else {
            const idxAll = value.filter(v => v.value === "all")[0];
            if (idxAll) {
                value.splice(idxAll, 1);
            }
            this.setState({ selectedStaff: value.map(v => v.value) })
        }
    };

    render() {
        const companyID = this.props.user.selectedCompany.id;
        const proxyToolbar = (id) => (toolbar) => {
            if (!this.state.toolbar[id]) {
                const stateToolbar = this.state.toolbar;
                stateToolbar[id] = toolbar;
                this.setState({ toolbar: stateToolbar });
            }
            return (<div />)
        };
        const selected = this.props.teams.filter(t => this.state.selectedTeams.indexOf(t.id) !== -1);
        const selectedStaff = this.props.staff.filter(s => this.state.selectedStaff.indexOf(s.id) !== -1);
        return (
            <Container className="Calendar" fluid>
                <Row>
                    {this.state.sidebarOpen &&
                        <Col md={3} className="bg-gray px-0 d-none d-md-block">
                            <div className="h-50 d-flex flex-column">
                                <h5 className="text-center text-white p-3 mb-0">Unassigned Staff</h5>
                                <StaffList className="flex-1 bg-white scroll-y" />
                            </div>
                            <div className="h-50 d-flex flex-column">
                                <h5 className="text-center text-white p-3 mb-0">Waiting Jobs</h5>
                                <JobList className="flex-1 bg-white scroll-y" />
                            </div>
                        </Col>}
                    <Col md={this.state.sidebarOpen ? 9 : 12} className="px-0">
                        <Toolbar toolbar={this.state.toolbar}
                            start={this.state.startDate}
                            companyID={companyID}
                            sidebarOpen={this.state.sidebarOpen}
                            sidebarToggle={this.sidebarToggle}
                            handleChange={this.handleChange}
                            loadEvents={this.props.loadEvents}
                            viewChange={this.viewChange}
                            selected={this.state.selectedTeams}
                            selectedStaff={this.state.selectedStaff}
                            selectedTeamsChanged={this.selectedTeamsChanged}
                            selectedStaffChanged={this.selectedStaffChanged}
                            teams={this.props.teams}
                            staff={this.props.staff} />
                        <div className={`calendar-container ${this.state.view} text-nowrap`}>
                            {selected.map(team =>
                                <div className="calendar-team" style={{ width: `${100 / (selectedStaff.length + selected.length)}%` }}
                                    key={team.id}>
                                    <h5 className="font-weight-bold text-center p-3 m-0 d-block" style={{
                                        backgroundColor: team.color,
                                        color: colorLuminance(team.color) > 0.5 ? "black" : "white"
                                    }}>{team.name}</h5>
                                    <DragAndDropCalendar
                                        step={15}
                                        timeslots={4}
                                        date={new Date(this.state.startDate)}
                                        onNavigate={this.onNavigate}
                                        selectable
                                        events={this.props.events.filter(e => Number(e.team_id) === team.id)}
                                        onEventDrop={this.moveEvent(team.id)}
                                        resizable
                                        onEventResize={this.resizeEvent(team.id)}
                                        defaultView="day"
                                        components={{
                                            toolbar: proxyToolbar(team.id),
                                            event: Event,
                                        }}
                                        formats={{ eventTimeRangeFormat: () => null }}
                                        onSelectEvent={event => this.setState({ appointment: new AppointmentModel(event) })}
                                        onSelectSlot={slotInfo => this.onSelectSlot(slotInfo, team.id, undefined)}
                                    />
                                </div>
                            )}
                            {selectedStaff.map(staff =>
                                <div className="calendar-team" style={{ width: `${100 / (selectedStaff.length + selected.length)}%` }}
                                    key={staff.id}>
                                    <h5 className="font-weight-bold text-center p-3 m-0 d-block">{staff.name}</h5>
                                    <DragAndDropCalendar
                                        date={new Date(this.state.startDate)}
                                        onNavigate={this.onNavigate}
                                        step={15}
                                        timeslots={4}
                                        selectable
                                        events={this.props.events.filter(e => Number(e.staff_id) === staff.id)}
                                        onEventDrop={this.moveEventStaff(staff.id)}
                                        resizable
                                        onEventResize={this.resizeEvent(staff.id)}
                                        defaultView="day"
                                        components={{
                                            toolbar: proxyToolbar(staff.id),
                                            event: Event,
                                        }}
                                        formats={{ eventTimeRangeFormat: () => null }}
                                        onSelectEvent={event => this.setState({ appointment: new AppointmentModel(event) })}
                                        onSelectSlot={slotInfo => this.onSelectSlot(slotInfo, undefined, staff.id)}
                                    />
                                </div>
                            )}
                            {selected.length < 1 && selectedStaff.length < 1 && <h1 className="text-center mt-5">Select a Team or Staff to continue</h1>}
                        </div>
                    </Col>
                    <BookingDialog
                        isOpen={this.state.modal}
                        toggleModal={this.toggleModal}
                        closeModal={this.closeModal}
                        start_time={this.state.selectedSlotTime.start}
                        end_time={this.state.selectedSlotTime.end}
                        team_id={this.state.team_id}
                        staff_id={this.state.staff_id}
                        appointment={this.state.appointment}
                        blockoff={this.state.blockoff} />
                    <AlertDialog
                        isOpen={this.state.alertModal}
                        toggleModal={this.toggleAlertModal}
                        event={this.state.event}
                        appt={this.state.appt}
                        closeModal={this.closeAlertModal}
                        editEvent={(event, appt) => this.editEvent(event, appt)} />
                </Row>
            </Container>
        );
    }
}

const mapState = state => ({
    ...state.calendar,
    request: state.calendar.request,
    user: state.user,
    teams: state.staff.staff.filter(team => team.id > 0),
    staff: state.staff.staff.filter(team => team.id === 0).reduce((arr, team) => {
        team.users.forEach(user => arr.push(user));
        return arr;
    }, []),
    customers: state.quotes.customers,
    services: state.service.services,
});
const mapActions = dispatch => (bindActionCreators({
    removeQuote,
    replaceEvent,
    setEvents,
    loadEvents,
    addEvent,
    getStaff,
    getServices: getList,
    getCustomers,
    editAppointment,
    editBlockoff,
    clearErrors,
}, dispatch));

export default withDragDropContext(connect(mapState, mapActions)(Calendar));
