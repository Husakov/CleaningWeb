import React from 'react';
import {
    Button,
    Col,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Popover,
    PopoverBody,
    PopoverHeader,
    Row,
} from "reactstrap";
import Icon from '@fortawesome/react-fontawesome'
import { faSync, faCaretDown } from "@fortawesome/fontawesome-free-solid/shakable.es";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { setDeepProp } from "../../util";
import { getCustomers, createCustomer, addProperty } from '../../reducers/quotesReducer';
import { createAppointment, editAppointment, deleteAppointment } from '../../reducers/calendarReducer';
import { getList } from '../../reducers/serviceReducer';
import { getStaff } from '../../reducers/staffReducer';
import { appointment as appointmentapi } from '../../api';
import moment from "moment/moment";
import BookingInfoForm from '../../components/Calendar/BookingInfoForm';
import AppointmentModel from '../../model/appointment';
import './BookingDialog.css';
import { toast } from 'react-toastify';

//status confirmed unconfirmed noshow cancelled
class ManualBooking extends React.Component {

    state = {
        //datepicker state
        appointment: new AppointmentModel(
            this.props.start_time, this.props.start_time,
            this.props.team_id, this.props.staff_id,
            this.props.user.selectedCompany.payment_settings.deposit_amount,
            this.props.user.selectedCompany.payment_settings.tax_percent),
        addressList: [],
        type: this.props.type ? this.props.type : "manual",
        repeat: {
            active: false,
            amount: 1,
            mode: "w",
            repeatOn: "days",
            radioDays: {
                Su: false,
                Mo: false,
                Tu: false,
                We: false,
                Th: false,
                Fr: false,
                Sa: false,
            },
            end_time: moment(`${moment().format('YYYY')}-12-31 11:45 PM `),
        },
        services: [],
        actionsOpen: false,
        tabOpen: 0
    };

    componentWillReceiveProps(newProps) {
        if (this.props.request.pending && newProps.request.fulfilled)
            this.props.closeModal();
        //services not loaded on first modal firing
        if (this.props.services.length !== newProps.services.length)
            this.setState({
                appointment: {
                    ...this.state.appointment,
                    appointment_services: [{
                        service_id: newProps.services[0] ? newProps.services[0].id : -1,
                        service_pricings: [],
                        add_ons: [],
                    }]
                }
            });

        //customers arent loaded on first modal fire
        if (this.props.customers.length !== newProps.customers.length)
            this.handleCustomerChange(newProps.customers, newProps.customers[newProps.customers.length - 1].id);

        //return to first tab if an error occurs
        if (this.props.errors !== newProps.errors) {
            //check if error occured is inside 2 tab or 
            // is about services
            let isErrorInServices = false;
            Object.keys(newProps.errors).forEach(error => {
                if (error.includes("appointment_services")) {
                    this.toggleTab(1);
                    isErrorInServices = true;
                }
            })
            //if not toggle 1. tab
            if (!isErrorInServices)
                this.toggleTab(0);
        }
    }

    componentWillMount() {
        if (!(this.props.customers.length > 0))
            this.props.getCustomers(this.props.user.selectedCompany.id);
        if (!(this.props.services.length > 0))
            this.props.getServices(this.props.user.selectedCompany.id);
        if (!(this.props.staff.length > 0))
            this.props.getStaff(this.props.user.selectedCompany.id);
        if (this.props.appointment) {
            if (this.props.appointment.id === -1) {
                const services = this.reduceServices(this.props.team_id, this.props.staff_id);
                this.setState({
                    appointment: {
                        ...new AppointmentModel(this.props.start_time, this.props.start_time,
                            this.props.team_id, this.props.staff_id,
                            this.props.user.selectedCompany.payment_settings.deposit_amount,
                            this.props.user.selectedCompany.payment_settings.tax_percent),
                        appointment_services: [{
                            service_id: this.props.services[0] ? this.props.services[0].id : -1,
                            service_pricings: [],
                            add_ons: [],
                        }],
                    },
                    services
                });
            }
            else {
                const services = this.reduceServices(this.props.appointment.team_id, this.props.appointment.staff_id);
                this.setState({ appointment: new AppointmentModel(this.props.appointment), services }, () => this.handleCustomerChange(this.props.customers, this.props.appointment.customer_id));
            }
        }
    }
    //get services of staff / team
    reduceServices(team_id, user_id) {
        let staff;
        let services = [];
        if (team_id) {
            staff = this.props.staff.find(staff => staff.id == team_id);
            staff.services.forEach(id => {
                services.push(this.props.services.find(service => service.id === id));
            });
        }
        else {
            staff = this.props.staff[this.props.staff.length - 1].users.find(user => user.id === user_id);
            staff.services.forEach(staff_service => {
                services.push(this.props.services.find(service => service.id === staff_service.id));
            });
        }
        return services;
    }
    toggleTab = (pos) => {
        this.setState({ tabOpen: pos })
    }

    calculateTotalPrice() {
        const appointment_services = [...this.state.appointment.appointment_services];
        let total = 0;
        appointment_services.forEach(service => {
            service.service_pricings.forEach(pricing => {
                total += Number(pricing.price);
            });

            service.add_ons.forEach(add_on => {
                total += Number(add_on.price);
            });
            if (service.discount) {
                if (service.discount.type === "f")
                    total -= 100 * service.discount.value;
                else {
                    let discount_amount = total * Number(service.discount.value) / 100;
                    total -= discount_amount;
                }
            }
        })
        const appointment = { ...this.state.appointment };
        if (appointment.discount.type === "f")
            total -= appointment.discount.value;
        else {
            let discount_amount = (total * Number(appointment.discount.value) / 10000);
            total -= discount_amount;
        }
        let tax_amount = total * Number(appointment.tax) / 100;
        total += tax_amount;
        this.handleFormInput("total", total);
    };

    handleTimeInput(field, value, prop) {
        let appointment = { ...this.state.appointment };
        let time = 0;
        time = appointment.duration % 60;
        if (prop === "hour") {
            time += value * 60;
        }
        else if (prop === "calc") {
            time = Number(value);
        }
        else {
            time = appointment.duration - time;
            time += Number(value);
        }
        const newStart = moment(appointment.start_time);
        newStart.add("minutes", time);
        appointment.end_time = newStart;
        this.setState({ appointment }, () => {
            this.handleFormInput(field, ~~time);
        })
    }


    handleStaffChange = (type, id) => {
        const appt = { ...this.state.appointment };
        if (type === "staff_id") {
            appt[type] = id;
            delete appt.team_id;
        }
        else {
            appt[type] = id;
            delete appt.staff_id;
        }
        const services = this.reduceServices(appt.team_id, appt.staff_id);
        this.setState({ appointment: appt, services });
    }

    handleFormInput = (field, data) => {
        const appointment = this.state.appointment;
        if (field.indexOf(".") !== -1) {
            const fields = field.split(".");
            setDeepProp(appointment, data, fields);
        } else {
            appointment[field] = data;
        }
        this.setState({ appointment }, () => {
            if (field.includes("discount") || field === "tax")
                this.calculateTotalPrice()
        });
    };
    handleServiceChange = (id, i) => {
        const appointment_services = [...this.state.appointment.appointment_services];
        appointment_services[i] = {
            service_id: id,
            service_pricings: [],
            add_ons: []
        };
        this.setState({ appointment: { ...this.state.appointment, appointment_services } }, () => this.calculateDuration());

    };

    handleCustomerChange = (customers, customer_id) => {
        const customer = customers.find(customer => customer.id == customer_id);
        const addressList = [];
        let address = this.state.appointment.address;
        if (customer) {
            if (customer.address)
                addressList.push(customer.address + ", " + customer.city + ", " + customer.zip);
            if (customer.address2)
                addressList.push(customer.address2 + ", " + customer.city + ", " + customer.zip);
            customer.properties.forEach(prop => addressList.push(prop.name));
            if (addressList.length > 0 && this.state.appointment.address.length < 1)
                address = addressList[0];
            this.setState({ addressList, appointment: { ...this.state.appointment, customer_id, customer, address } }, () => console.log(this.state.appointment));
        }
    };

    addPricing = (pricing, i) => {
        const appointment_services = [...this.state.appointment.appointment_services];
        appointment_services[i].service_pricings.push({ ...pricing, quantity: "", price: "" });
        this.setState({ appointment: { ...this.state.appointment, appointment_services } }, () => this.calculateDuration())
    };
    calculateDuration = () => {
        const services = [...this.state.appointment.appointment_services];
        let duration = 0;
        services.forEach(service => {
            service.service_pricings.forEach(pricing => {
                let rules = [];
                if (pricing.rules) {
                    rules = pricing.rules;
                }
                else {
                    //if service on edit no rules in object
                    //so we find pricing rules from original services
                    const serviceIndex = this.props.services.findIndex(srv => srv.id === service.service_id);
                    const pricingIndex = this.props.services[serviceIndex].pricings.findIndex(prc => prc.id === pricing.id);
                    rules = this.props.services[serviceIndex].pricings[pricingIndex].rules;
                }
                rules.forEach((rule) => {
                    if (pricing.quantity >= rule.from && pricing.quantity <= rule.to)
                        duration += rule.duration;
                })
            });
            service.add_ons.forEach(add_on => {
                let rules = [];
                if (add_on.rules) {
                    rules = add_on.rules;
                }
                else {
                    //if service on edit no rules in object
                    //so we find pricing rules from original services
                    const serviceIndex = this.props.services.findIndex(srv => srv.id === service.service_id);
                    const addonIndex = this.props.services[serviceIndex].addons.findIndex(adn => adn.id === add_on.id);
                    rules = this.props.services[serviceIndex].addons[addonIndex].rules;
                }
                rules.forEach((rule) => {
                    if (add_on.quantity >= rule.from && add_on.quantity <= rule.to)
                        duration += rule.duration;
                })
            })
        });
        this.calculateTotalPrice();
        this.handleTimeInput("duration", duration, "calc");
    };
    addAddon = (addon, i) => {
        const appointment_services = [...this.state.appointment.appointment_services];
        appointment_services[i].add_ons.push({
            title: addon.title,
            id: addon.id,
            quantity: "",
            price: "",
            rules: addon.rules
        });
        this.setState({ appointment: { ...this.state.appointment, appointment_services } }, () => this.calculateDuration());
    };
    handlePricingChange = (value, type, i, j) => {
        const appointment_services = [...this.state.appointment.appointment_services];

        if (type === "quantity") {
            appointment_services[i].service_pricings[j][type] = value;
            const service = this.props.services.find(service => service.id == appointment_services[i].service_id);
            const pricing = service.pricings.find(pricing => pricing.id == appointment_services[i].service_pricings[j].id);
            appointment_services[i].service_pricings[j]["price"] = this.calculatePricingPrice(
                pricing, value
            );
        }
        else
            appointment_services[i].service_pricings[j][type] = Math.round(value * 100);
        this.setState({ appointment: { ...this.state.appointment, appointment_services } }, () => this.calculateDuration());
    };
    handleAddonChange = (value, type, i, j) => {
        const appointment_services = [...this.state.appointment.appointment_services];

        if (type === "quantity") {
            appointment_services[i].add_ons[j][type] = value;
            const service = this.props.services.find(service => service.id == appointment_services[i].service_id);
            const addon = service.addons.find(a => a.id == appointment_services[i].add_ons[j].id);
            appointment_services[i].add_ons[j]["price"] = this.calculateAddonPrice(
                addon, value
            );
        }
        else
            appointment_services[i].add_ons[j][type] = Math.round(value * 100);
        this.setState({ appointment: { ...this.state.appointment, appointment_services } }, () => this.calculateDuration());
    };
    calculatePricingPrice = (pricing, value) => {
        let price = 0;
        pricing.rules.forEach(rule => {
            if (rule['from'] <= value && rule['to'] >= value) {
                if (pricing.type === "flat")
                    price = value * rule['value'];
                else if (pricing.type === "range")
                    price = rule['value'];
            }
        });
        return 100 * price;
    };
    calculateAddonPrice = (addon, value) => {
        let price = 0;
        addon.rules.forEach(rule => {
            if (rule['from'] <= value && rule['to'] >= value)
                price = value * rule['value'];
        })
        return 100 * price;
    };
    chooseDiscount = (discount, i) => {
        const appointment_services = [...this.state.appointment.appointment_services];
        appointment_services[i].discount = discount;
        appointment_services[i].discount_id = discount.id;
        this.setState({
            appointment: {
                ...this.state.appointment,
                appointment_services
            }
        }, () => this.calculateTotalPrice());
    };
    addService = () => {
        const appointment_services = [...this.state.appointment.appointment_services];
        appointment_services.push({
            name: this.props.services[0].name,
            service_id: this.props.services[0].id,
            service_pricings: [],
            add_ons: []
        });
        this.setState({ appointment: { ...this.state.appointment, appointment_services } });
    };
    removeService = (i) => {
        const appointment_services = [...this.state.appointment.appointment_services];
        appointment_services.splice(i, 1)
        this.setState({ appointment: { ...this.state.appointment, appointment_services } });
    }
    selectAddress = (address) => {
        this.setState({ appointment: { ...this.state.appointment, address } });
    };
    changeStartTime = (time) => {
        let duration = moment.duration(this.state.appointment.end_time.diff(time));
        let minutes = duration.asMinutes();
        this.setState({ appointment: { ...this.state.appointment, start_time: time, duration: minutes } });
    };
    changeEndTime = (time) => {
        let duration = moment.duration(time.diff(this.state.appointment.start_time));
        let minutes = duration.asMinutes();
        this.setState({ appointment: { ...this.state.appointment, end_time: time, duration: minutes } })
    };
    //repeat
    toggleRepeat = (e) => {
        this.setState({
            repeat: {
                ...this.state.repeat, active: e.currentTarget.value === 'Repeat',
                radioDays: {
                    Su: this.state.appointment.start_time.format("dddd") === "Sunday",
                    Mo: this.state.appointment.start_time.format("dddd") === "Monday",
                    Tu: this.state.appointment.start_time.format("dddd") === "Tuesday",
                    We: this.state.appointment.start_time.format("dddd") === "Wednesday",
                    Th: this.state.appointment.start_time.format("dddd") === "Thursday",
                    Fr: this.state.appointment.start_time.format("dddd") === "Friday",
                    Sa: this.state.appointment.start_time.format("dddd") === "Saturday",
                }
            }
        });
    };
    toggleRepeatNumber = (e) => {
        this.setState({ repeat: { ...this.state.repeat, amount: e.currentTarget.value } });
    };
    toggleRepeatType = (e) => {
        this.setState({ repeat: { ...this.state.repeat, mode: e.currentTarget.value === "weeks" ? "w" : "m" } });
    };
    toggleRepeatOn = (e) => {
        this.setState({ repeat: { ...this.state.repeat, repeatOn: e.currentTarget.value } });
    };
    toggleRadioDays = (e) => {
        const days = { ...this.state.repeat.radioDays };
        days[e.currentTarget.name] = !days[e.currentTarget.name];
        this.setState({
            repeat: { ...this.state.repeat, radioDays: days }
        })
    };
    handleChangeEndTime = (date) => {
        this.setState({ repeat: { ...this.state.repeat, end_time: date } });
    };
    cancelAppointment = () => {
        const appt = { ...this.props.appointment };
        delete appt.appointment_services;
        appt.status = 'Cancelled';
        this.props.editAppointment(this.props.user.selectedCompany.id, { status: "Cancelled" }, this.props.appointment.id)
    };


    togglePricing(pricing, i) {
        const appointment = { ...this.state.appointment };
        let index = appointment.appointment_services[i].service_pricings.findIndex(p => pricing.id === p.id);
        if (index === -1)
            this.addPricing(pricing, i);
        else this.removePricing(i, index);
    }

    removePricing(i, j) {
        const appointment_services = [...this.state.appointment.appointment_services];
        appointment_services[i].service_pricings.splice(j, 1);
        this.setState({ appointment: { ...this.state.appointment, appointment_services } }, () => this.calculateDuration());
    };

    toggleAddon(addon, i) {
        const appointment = { ...this.state.appointment };
        let index = appointment.appointment_services[i].add_ons.findIndex(p => addon.id === p.id);
        if (index === -1)
            this.addAddon(addon, i);
        else this.removeAddon(i, index);
    };

    removeAddon(i, j) {
        const appointment_services = [...this.state.appointment.appointment_services];
        appointment_services[i].add_ons.splice(j, 1);
        this.setState({ appointment: { ...this.state.appointment, appointment_services } }, () => this.calculateDuration());
    };

    removeDiscount(i) {
        const appointment_services = { ...this.state.appointment.appointment_services };
        delete appointment_services[i].discount;
        delete appointment_services[i].discount_id;
        this.setState({ quote: { ...this.state.appointment, appointment_services } }, () => this.calculateTotalPrice())
    }
    createAppointment(quote = false) {
        const appt = { ...this.state.appointment };
        const repeat = { ...this.state.repeat };
        if (repeat.active) {
            if (repeat.mode === "w") {
                let days = [];
                Object.values(repeat.radioDays).forEach((item, i) => {
                    if (item)
                        days.push(i);
                });
                appt.repeat = {
                    mode: repeat.mode,
                    amount: repeat.amount,
                    days,
                    end: repeat.end_time.toISOString()
                }
            }
            else {
                appt.repeat = {
                    mode: repeat.mode,
                    amount: repeat.amount,
                    end: repeat.end_time.toISOString()
                };
                if (repeat.repeatOn === "days")
                    appt.repeat.day = appt.start_time.day();
                else
                    appt.repeat.day = appt.start_time.date();
            }
        }
        else
            delete appt.repeat;
        appt.discount.value = appt.discount.value / 100;
        appt.tax === "" ? appt.tax = 0 : appt.tax = appt.tax;
        appt.start_time = this.state.appointment.start_time.add("hours", 2).toISOString();
        appt.end_time = this.state.appointment.end_time.add("hours", 2).toISOString();
        appt.generate_quote = quote;
        delete appt.customer;
        this.props.createAppointment(this.props.user.selectedCompany.id, appt, quote);
    }
    createQuoteFromAppt() {
        appointmentapi(this.props.user.selectedCompany.id).toQuote(this.props.appointment.id);
        this.props.closeModal();
        toast.success("Quote Created!");
    }
    viewInvoice() {
        const win = window.open(this.props.appointment.invoice.url, '_blank');
        win.focus();
    }

    editAppointment() {
        const appt = { ...this.state.appointment };
        appt.start_time = this.state.appointment.start_time.add("hours", 2).toISOString();
        appt.end_time = this.state.appointment.end_time.add("hours", 2).toISOString();
        appt.discount.value = appt.discount.value >= 100 ? appt.discount.value / 100 : appt.discount.value;
        appt.deposit.amount = appt.deposit.amount ? appt.deposit.amount : 0;
        this.props.editAppointment(this.props.user.selectedCompany.id, appt, appt.id);
    }

    editCustomer(customeradd) {
        this.props.addProperty(this.state.appointment.customer_id, { name: customeradd.address + ", " + customeradd.city + ", " + customeradd.zip });
        const addressList = [...this.state.addressList];
        addressList.push(customeradd.address + ", " + customeradd.city + ", " + customeradd.zip);
        this.setState({
            appointment: {
                ...this.state.appointment,
                address: customeradd.address + ", " + customeradd.city + ", " + customeradd.zip
            }, addressList
        });
    }
    cancelAppointment = () => {
        const appt = { ...this.props.appointment };
        delete appt.appointment_services;
        appt.status = 'Cancelled';
        this.props.editAppointment(this.props.user.selectedCompany.id, { status: "Cancelled" }, this.props.appointment.id)
    }
    toggleEditPopover = () => {
        this.setState({ editPopover: !this.state.editPopover })
    }
    render() {
        return (
            <Row>
                <Col md={12} xs={12}>
                    <BookingInfoForm
                        staff={this.props.staff}
                        recurring={this.props.appointment.repeat_id}
                        company_id={this.props.user.selectedCompany.id}
                        customers={this.props.customers}
                        services={this.state.services}
                        addressList={this.state.addressList}
                        appointment={this.state.appointment}
                        handleFormInput={this.handleFormInput}
                        handleTimeInput={this.handleTimeInput.bind(this)}
                        handleCustomerChange={this.handleCustomerChange}
                        handleServiceChange={this.handleServiceChange}
                        togglePricing={(pricing, i) => this.togglePricing(pricing, i)}
                        toggleAddon={(addon, i) => this.toggleAddon(addon, i)}
                        removePricing={(i, j) => this.removePricing(i, j)}
                        removeAddon={(i, j) => this.removeAddon(i, j)}
                        handlePricingChange={this.handlePricingChange}
                        handleAddonChange={this.handleAddonChange}
                        handleDiscountChange={this.handleDiscountChange}
                        handleStaffChange={this.handleStaffChange}
                        removeDiscount={(i) => this.removeDiscount(i)}
                        chooseDiscount={(discount, i) => this.chooseDiscount(discount, i)}
                        addService={() => this.addService()}
                        removeService={(i) => this.removeService(i)}
                        selectAddress={this.selectAddress}
                        changeStartTime={(time) => this.changeStartTime(time)}
                        changeEndTime={(time) => this.changeEndTime(time)}
                        createCustomer={(customer) => this.props.createCustomer(customer)}
                        customerReq={this.props.customerReq}
                        errors={this.props.errors}
                        editCustomer={(customer) => this.editCustomer(customer)}
                        tabOpen={this.state.tabOpen}
                        toggleTab={(pos) => this.toggleTab(pos)}
                        //repeat
                        repeat={this.state.repeat}
                        toggleRepeat={this.toggleRepeat}
                        toggleRepeatNumber={this.toggleRepeatNumber}
                        toggleRepeatType={this.toggleRepeatType}
                        toggleRepeatOn={this.toggleRepeatOn}
                        toggleRadioDays={this.toggleRadioDays}
                        handleChangeEndTime={this.handleChangeEndTime}
                    />
                </Col>
                {(this.props.appointment.id > 0 || this.state.tabOpen === 2) && <Col className="d-flex justify-content-end" md={{ size: 4, offset: 8 }}>

                    {!this.props.appointment.repeating && <Button color="success"
                        id="appt-button"
                        disabled={this.props.request.pending}
                        onClick={() => this.props.appointment.id === -1 ? this.createAppointment() : (this.props.appointment.repeat_id || this.props.appointment.repeating ? this.toggleEditPopover() : this.editAppointment())}>
                        {this.props.request.pending ? <Icon spin icon={faSync} /> : ''}
                        {this.props.appointment.id > 0 ? "Edit Appointment" : "Create Appointment"}</Button>}
                    <Dropdown
                        id="appt-caret-button"
                        className="pl-2"
                        isOpen={this.state.actionsOpen}
                        toggle={() => this.setState({ actionsOpen: !this.state.actionsOpen })}>
                        <DropdownToggle
                            color="success">
                            <Icon icon={faCaretDown} />
                        </DropdownToggle>
                        <DropdownMenu>
                            <DropdownItem style={{ cursor: 'pointer' }} onClick={() => this.props.appointment.id === -1 ? this.createAppointment(true) : this.createQuoteFromAppt()}>
                                {this.props.appointment.id === -1 ? "Create Appointment and Generate Quote" : "Generate Quote"}
                            </DropdownItem>
                            {this.props.appointment.id !== -1 && <React.Fragment>
                                <DropdownItem style={{ cursor: 'pointer' }}
                                    onClick={() => this.viewInvoice()}>
                                    View Invoice
                                </DropdownItem>
                                <DropdownItem style={{ cursor: 'pointer' }}
                                    onClick={() => this.cancelAppointment()}
                                >Cancel</DropdownItem>
                            </React.Fragment>}
                        </DropdownMenu>
                    </Dropdown>
                    {/*Popover for recurring appts.*/}
                    <Popover
                        placement="right"
                        target="appt-caret-button"
                        isOpen={this.state.editPopover}
                        toggle={() => this.setState({
                            editPopover: !this.state.editPopover
                        })}>
                        <PopoverHeader>Recurring appointment!</PopoverHeader>
                        <PopoverBody>
                            Editing this appointment will edit all recurring appointments, are you sure you want to continue?
                            <div className="d-flex justify-content-between">
                                <Button color="info"
                                    onClick={() => this.editAppointment()}>
                                    Yes
                            </Button>
                                <Button color="secondary"
                                    onClick={() => this.setState({
                                        editPopover: !this.state.editPopover
                                    })}>
                                    Cancel
                            </Button>
                            </div>
                        </PopoverBody>
                    </Popover>
                </Col>}
                {(this.props.appointment.id === -1 && this.state.tabOpen < 2) &&
                    <Col md={{ size: 4, offset: 8 }}>
                        <button onClick={() => this.toggleTab(this.state.tabOpen + 1)} className="btn btn-primary steps-button" type="submit" style={{ float: 'right' }}>Next</button>
                    </Col>}
            </Row >
        )
    }
}

function mapState(state) {
    return {
        customers: state.quotes.customers,
        customerReq: state.quotes.customerReq,
        customerErrors: state.quotes.customerErrors,
        errors: state.calendar.errors,
        user: state.user,
        services: state.service.services,
        staff: state.staff.staff,
        request: state.calendar.request
    }
}

function mapDispatch(dispatch) {
    return bindActionCreators({
        getCustomers,
        getServices: getList,
        createCustomer,
        createAppointment,
        editAppointment,
        deleteAppointment,
        getStaff,
        addProperty,
    }, dispatch)
}

export default connect(mapState, mapDispatch)(ManualBooking)
