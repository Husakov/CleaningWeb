import React, { Fragment } from 'react';
import {
    Button,
    Col,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    FormFeedback,
    Input,
    InputGroup,
    InputGroupAddon,
    Label,
    Nav,
    NavItem,
    NavLink,
    Row,
    TabContent,
    TabPane,
    Tooltip
} from "reactstrap";
import Icon from '@fortawesome/react-fontawesome'
import { faCalendar, faHistory, faPencilAlt, faServer, faTrash, } from "@fortawesome/fontawesome-free-solid/shakable.es";
import InputField from "../InputField";
import Toggle from '../Toggle';
import MultipleSelectDropdown from '../MultipleSelectDropdown';
import { getError, setDeepProp } from "../../util";
import Select from '@kemoke/react-select';
import CustomerModel from '../../model/customer'
import DatePicker from 'react-datepicker';
import moment from 'moment';
import Repeat from '../staff/Repeat';

const tabs = [
    { name: 'Details', icon: faCalendar },
    { name: 'Services', icon: faServer },
    { name: 'Notes', icon: faPencilAlt },
    { name: 'History', icon: faHistory }];

class BookingInfoForm extends React.Component {
    state = {
        discountsOpen: this.props.appointment.appointment_services.map((service) => false),
        addAddress: false,
        addCustomer: false,
        addDiscount: this.props.appointment.appointment_services.map((service) => false),
        address: "",
        city: "",
        zip: "",
        customer: new CustomerModel(),
        tooltipOpen: false,
        durationTooltip: false,
    };
    handleCustomerInputChange = (field, data) => {
        const customer = this.state.customer;
        if (field.indexOf(".") !== -1) {
            const fields = field.split(".");
            setDeepProp(customer, data, fields);
        } else {
            customer[field] = data;
        }
        this.setState({ customer });
    };

    componentWillReceiveProps(newProps) {
        if (!this.props.customerReq.fulfilled && newProps.customerReq.fulfilled)
            this.setState({
                addCustomer: false
            });
    };

    error(name) {
        if (!this.props.errors) return undefined;
        return getError(this.props.errors, name);
    };

    toggle() {
        this.setState({
            tooltipOpen: !this.state.tooltipOpen
        });
    }

    render() {
        const {
            appointment, handleFormInput, handleServiceChange, handleStaffChange,
            handlePricingChange, handleAddonChange, services, chooseDiscount, removeDiscount,
            toggleRepeat, repeat, toggleRepeatNumber, toggleRepeatType,
            toggleRepeatOn, toggleRadioDays, handleChangeEndTime,
            depositEnabled, depositToggle,
        } = this.props;
        return (
            <Row>
                <Col md={12}>
                    <Nav tabs className="mt-3">
                        {tabs.map((tab, i) =>
                            <NavItem key={i}>
                                <NavLink active={this.props.tabOpen === i}
                                    onClick={() => this.props.toggleTab(i)}>
                                    <Icon icon={tab.icon} /><span className="ml-1">{tab.name}</span>
                                </NavLink>
                            </NavItem>
                        )}
                    </Nav>
                    <TabContent activeTab={this.props.tabOpen}>
                        <TabPane tabId={0}>
                            <Col md={12} className="mb-2 mt-2 d-flex p-0">
                                <Col md={4} className="d-flex align-items-center">
                                    <Label for="customer">
                                        Duration:
                                    </Label>
                                </Col>
                                <Col md={8} className="d-flex justify-content-between" id="duration-tooltip">
                                    <div className="w-100">
                                        <Label for="customer">
                                            Start Time:
                                        </Label>
                                        <DatePicker
                                            selected={moment(this.props.appointment.start_time)}
                                            showTimeSelect
                                            onChange={(e) => this.props.changeStartTime(e)}
                                            onSelect={(e) => this.props.changeStartTime(e)}
                                            timeFormat="HH:mm A"
                                            timeIntervals={15}
                                            className="form-control"
                                            dateFormat="MM/DD/YYYY hh:mm A"
                                            timeCaption="time"
                                            disabled={this.props.recurring ? true : false}
                                        />
                                        <FormFeedback />
                                    </div>
                                    <div style={{ marginLeft: "10px" }} className="w-100">
                                        <Label for="customer">
                                            End Time:
                                        </Label>
                                        <DatePicker
                                            selected={moment(this.props.appointment.end_time)}
                                            onChange={(e) => this.props.changeEndTime(e)}
                                            onSelect={(e) => this.props.changeEndTime(e)}
                                            showTimeSelect
                                            timeFormat="HH:mm A"
                                            timeIntervals={15}
                                            className="form-control"
                                            dateFormat="MM/DD/YYYY hh:mm A"
                                            timeCaption="time"
                                            disabled={this.props.recurring ? true : false}
                                        />
                                        <FormFeedback>{this.error("duration")}</FormFeedback>
                                    </div>
                                    {this.props.recurring && <Tooltip placement="top" isOpen={this.state.durationTooltip} target={"duration-tooltip"}
                                        toggle={() => { this.setState({ durationTooltip: !this.state.durationTooltip }) }}>
                                        Event time cannot be changed in recurring appointments
                                    </Tooltip>}
                                </Col>
                            </Col>
                            {appointment.id === -1 && <Col className="d-flex input-row mb-2 p-0" md={12}>
                                <Col md={4} className="d-flex align-items-center">
                                    <Label for="customer">
                                        Repeat
                        </Label>
                                </Col>
                                <Col md={8} className="pl-0">
                                    <Repeat
                                        startDate={appointment.start_time}
                                        repeat={repeat.active}
                                        toggleRepeat={toggleRepeat}
                                        toggleRepeatNumber={toggleRepeatNumber}
                                        toggleRepeatType={toggleRepeatType}
                                        toggleRepeatOn={toggleRepeatOn}
                                        toggleRadioDays={toggleRadioDays}
                                        handleChangeEndTime={handleChangeEndTime}
                                        repeatEndTime={repeat.end_time}
                                        repeatNumber={repeat.number ? repeat.number : 0}
                                        repeatType={repeat.mode ? repeat.mode : "w"}
                                        radioDays={repeat.radioDays ? repeat.radioDays : {}}
                                    />
                                </Col>
                            </Col>}
                            <Col className="d-flex input-row mb-2 p-0" md={12}>
                                <Col md={4} className="d-flex align-items-center">
                                    <Label for="customer">
                                        Select Customer <span className="text-danger">*</span>
                                    </Label>
                                </Col>
                                <Col md={8}>
                                    <Select
                                        className="w-100"
                                        name="customer"
                                        value={this.props.appointment.customer_id}
                                        onChange={e => this.props.handleCustomerChange(this.props.customers, e ? e.value : null)}
                                        labelKey={"name"}
                                        options={this.props.customers.map(customer => {
                                            return {
                                                value: customer.id,
                                                name: customer.first_name + " " + customer.last_name
                                            }
                                        })}
                                    />
                                    <FormFeedback>{this.error("customer_id")}</FormFeedback>
                                </Col>
                            </Col>
                            <Col md={12} className="p-0">
                                <Button color="link"
                                    onClick={() => this.setState({ addCustomer: !this.state.addCustomer })}>Add new
                                    Customer</Button>
                            </Col>
                            {this.state.addCustomer && <Col md={12} className="p-0">
                                <Col md={{ size: 8, offset: 4 }} className="p-0 mb-2 d-flex">
                                    <InputField label="First Name"
                                        name="first_name"
                                        required
                                        value={this.state.customer.first_name}
                                        handleFormInput={this.handleCustomerInputChange} />
                                </Col>
                                <Col md={{ size: 8, offset: 4 }} className="p-0 mb-2 d-flex">
                                    <InputField label="Last Name"
                                        name="last_name"
                                        required
                                        value={this.state.customer.last_name}
                                        handleFormInput={this.handleCustomerInputChange} />
                                </Col>
                                <Col md={{ size: 8, offset: 4 }} className="p-0 mb-2 d-flex">
                                    <InputField label="E-mail"
                                        name="email"
                                        required
                                        value={this.state.customer.email}
                                        handleFormInput={this.handleCustomerInputChange} />
                                </Col>
                                <Col md={{ size: 8, offset: 4 }} className="p-0 mb-2 d-flex">
                                    <InputField label="Password"
                                        name="password"
                                        required
                                        value={this.state.customer.password}
                                        handleFormInput={this.handleCustomerInputChange} />
                                </Col>
                                <Col md={{ size: 8, offset: 4 }} className="p-0 mb-2 d-flex">
                                    <InputField label="Main Phone"
                                        name="phone_number"
                                        prepend="+1"
                                        required
                                        value={this.state.customer.phone_number}
                                        handleFormInput={this.handleCustomerInputChange} />
                                </Col>
                                <Col md={{ size: 4, offset: 8 }}>
                                    <Button color="success"
                                        className="w-100 mb-2"
                                        disabled={this.props.customerReq.pending}
                                        onClick={() => this.props.createCustomer({
                                            ...this.state.customer,
                                            company_id: this.props.company_id
                                        })}
                                    >Add Customer</Button>
                                </Col>
                            </Col>
                            }
                            <Col className="d-flex input-row mb-2 p-0" md={12}>
                                <Col md={4} className="d-flex align-items-center">
                                    <Label for="customer">
                                        Select Customer Address <span className="text-danger">*</span>
                                    </Label>
                                </Col>
                                <Col md={8}>
                                    <Select
                                        className="w-100"
                                        name="address"
                                        value={appointment.address}
                                        onChange={(e) => this.props.selectAddress(e ? e.value : null)}
                                        labelKey={"name"}
                                        options={this.props.addressList.map(address => {
                                            return { value: address, name: address }
                                        })}
                                    />
                                    <FormFeedback>{this.error("address")}</FormFeedback>
                                </Col>
                            </Col>
                            {this.props.appointment.customer_id && <Col md={12} className="p-0">
                                <Button color="link"
                                    onClick={() => this.setState({ addAddress: !this.state.addAddress })}>Add new
                                    address</Button>
                            </Col>}

                            {this.state.addAddress &&
                                <Col md={12} className="p-0">
                                    <Col md={{ size: 8, offset: 4 }} className="p-0 mb-2 d-flex">
                                        <InputField label="Address"
                                            name="address"
                                            value={this.state.address}
                                            handleFormInput={(field, data) => this.setState({ address: data })} />
                                    </Col>
                                    <Col md={{ size: 8, offset: 4 }} className="p-0 mb-2 d-flex">
                                        <InputField label="City"
                                            name="city"
                                            value={this.state.city}
                                            handleFormInput={(field, data) => this.setState({ city: data })} />
                                    </Col>
                                    <Col md={{ size: 8, offset: 4 }} className="p-0 mb-2 d-flex">
                                        <InputField label="Zip"
                                            name="address"
                                            value={this.state.zip}
                                            handleFormInput={(field, data) => this.setState({ zip: data })} />
                                    </Col>
                                    <Col md={{ size: 4, offset: 8 }}>
                                        <Button color="success"
                                            className="w-100 mb-2"
                                            onClick={() => {
                                                this.props.editCustomer({
                                                    address: this.state.address,
                                                    city: this.state.city, zip: this.state.zip
                                                });
                                                this.setState({ addAddress: false })
                                            }}>Add address</Button>
                                    </Col>
                                </Col>
                            }
                            <Col md={12} className="d-flex align-items-center mb-2 p-0">
                                <Col md={4}>
                                    <Label>
                                        Staff: <span className="text-danger">*</span>
                                    </Label>
                                </Col>
                                <Col md={8}>
                                    <Input type="select"
                                        onChange={(e) => {
                                            const value = e.target.value.split(" ");
                                            const type = value[0];
                                            const id = value[1];
                                            handleStaffChange(type, id)
                                        }}
                                        value={appointment.team_id ? `team_id ${appointment.team_id}` : `staff_id ${appointment.user_id}`}
                                        className="w-100">
                                        <optgroup label="Teams">
                                            {this.props.staff.map((team) => {
                                                return (
                                                    team.id !== 0 && <option value={`team_id ${team.id}`}
                                                        key={team.id}>{team.name}</option>
                                                )
                                            })}
                                        </optgroup>
                                        <optgroup label="Staff">
                                            {this.props.staff[this.props.staff.length - 1].users.map(user => {
                                                return (
                                                    <option value={`staff_id ${user.id}`}
                                                        key={user.id}>{user.name}</option>
                                                )
                                            })}
                                        </optgroup>
                                    </Input>
                                    <FormFeedback>{this.error("staff")}</FormFeedback>
                                </Col>
                            </Col>
                            <Col md={12} className="d-flex align-items-center mb-2 p-0">
                                <Col md={4}>
                                    <Label>
                                        Status:
                                    </Label>
                                </Col>
                                <Col md={8}>
                                    <Input type="select"
                                        onChange={(e) => handleFormInput("status", e.target.value)}
                                        value={appointment.status}
                                        className="w-100">
                                        <option value="Confirmed">Confirmed</option>
                                        <option value="Unconfirmed">Unconfirmed</option>
                                        <option value="No-Show">No-Show</option>
                                    </Input>
                                    <FormFeedback>{this.error("staff")}</FormFeedback>
                                </Col>
                            </Col>
                        </TabPane>
                        <TabPane tabId={1}>
                            {
                                appointment.appointment_services.map((service, i) => {
                                    return (
                                        <Col md={12} className="p-0 mt-2" key={i}>
                                            <Col md={12} className="d-flex align-items-center p-0 mb-2">
                                                <Col md={4} className="d-flex align-items-center">
                                                    <Label for="service">
                                                        Select Service <span className="text-danger">*</span>
                                                    </Label>
                                                </Col>
                                                <Col md={6}>
                                                    <Input
                                                        type="select"
                                                        className="w-100"
                                                        name="service"
                                                        value={service.service_id}
                                                        onChange={(e) => handleServiceChange(e.target.value, i)}
                                                    >
                                                        {this.props.services.map(srv => {
                                                            return (
                                                                <option key={srv.id} value={srv.id}>{srv.name}</option>
                                                            )
                                                        })}
                                                    </Input>
                                                    <FormFeedback />
                                                </Col>
                                                {i !== 0 && <Col md={2}>
                                                    <Button
                                                        onClick={() => this.props.removeService(i)}
                                                        color="danger"><Icon icon={faTrash} /></Button>
                                                </Col>}
                                            </Col>
                                            <Col className="d-flex input-row mb-2" md={{ size: 8, offset: 4 }}>
                                                <MultipleSelectDropdown
                                                    color="success"
                                                    title="Pricings"
                                                    toggle={(pricing) => this.props.togglePricing(pricing, i)}
                                                    items={services.find(srv => srv.id == service.service_id) ? services.find(srv => srv.id == service.service_id).pricings.map(pricing => {
                                                        let checked = false;
                                                        service.service_pricings.map((appt_pricing) => {
                                                            if (pricing.id === appt_pricing.id)
                                                                checked = true;
                                                        });
                                                        return { ...pricing, checked, name: pricing.unit }
                                                    }) : []}
                                                />
                                            </Col>
                                            {service.service_pricings.map((pricing, j) => {
                                                return (
                                                    <Fragment key={j}>
                                                        <Col md={12} className="p-0 d-flex mb-2">
                                                            <Col md={4} key="label" className="d-flex align-items-center">
                                                                <Label>
                                                                    {pricing.unit}
                                                                </Label>
                                                            </Col>
                                                            <Col md={7} className="d-flex">
                                                                <Input
                                                                    min={0}
                                                                    name={i}
                                                                    type="number"
                                                                    onChange={(e) => handlePricingChange(e.target.value, "quantity", i, j)}
                                                                    value={pricing.quantity}
                                                                    placeholder="Quantity" />
                                                                <Input
                                                                    name={i}
                                                                    type="number"
                                                                    onChange={(e) => handlePricingChange(e.target.value, "price", i, j)}
                                                                    value={Number(pricing.price) > 0 ? pricing.price / 100 : ""}
                                                                    placeholder="Price" />
                                                            </Col>
                                                            <Col md={1} className="d-flex justify-content-end">
                                                                <Button
                                                                    color="danger"
                                                                    className=" d-flex justify-content-center"
                                                                    onClick={() => this.props.removePricing(i, j)}
                                                                ><Icon icon={faTrash} /></Button>
                                                            </Col>
                                                        </Col>
                                                        <Col md={{ size: 8, offset: 4 }} className="mb-2">
                                                            <FormFeedback>{this.error("appointment_services." + i + ".service_pricings." + j + ".quantity")}</FormFeedback>
                                                        </Col>
                                                    </Fragment>
                                                )
                                            })}
                                            <Col className="d-flex input-row mb-2" md={{ size: 8, offset: 4 }}>
                                                <MultipleSelectDropdown
                                                    color="success"
                                                    title="Addons"
                                                    toggle={(addon) => this.props.toggleAddon(addon, i)}
                                                    items={services.find(srv => srv.id == service.service_id) ? services.find(srv => srv.id == service.service_id).addons.map(addon => {
                                                        let checked = false;
                                                        service.add_ons.map((appt_addon) => {
                                                            if (addon.id === appt_addon.id)
                                                                checked = true;
                                                        });
                                                        return { ...addon, checked, name: addon.title }
                                                    }) : []}
                                                />
                                            </Col>
                                            {service.add_ons.map((addon, j) => {
                                                return (
                                                    <Fragment key={j}>
                                                        <Col md={12} key={j} className="p-0 d-flex mb-2">
                                                            <Col md={4} key="label" className="d-flex align-items-center">
                                                                <Label>
                                                                    {addon.title}
                                                                </Label>
                                                            </Col>
                                                            <Col md={7} className="d-flex">
                                                                <Input
                                                                    name={i}
                                                                    min={0}
                                                                    type="number"
                                                                    onChange={(e) => handleAddonChange(e.target.value, "quantity", i, j)}
                                                                    value={addon.quantity}
                                                                    placeholder="Quantity" />
                                                                <Input
                                                                    name={i}
                                                                    type="number"
                                                                    onChange={(e) => handleAddonChange(e.target.value, "price", i, j)}
                                                                    value={Number(addon.price) > 0 ? addon.price / 100 : ""}
                                                                    placeholder="Price" />
                                                            </Col>
                                                            <Col md={1} className="d-flex justify-content-end">
                                                                <Button
                                                                    color="danger"
                                                                    className=" d-flex justify-content-center"
                                                                    onClick={() => this.props.removeAddon(i, j)}
                                                                ><Icon icon={faTrash} /></Button>
                                                            </Col>
                                                        </Col>
                                                        <Col md={{ size: 8, offset: 4 }} className="mb-2">
                                                            <FormFeedback>{this.error("appointment_services." + i + ".add_ons." + j + ".quantity")}</FormFeedback>
                                                        </Col>
                                                    </Fragment>
                                                )
                                            })}
                                            <Col className="d-flex input-row mb-2" md={{ size: 8, offset: 4 }}>
                                                <Dropdown
                                                    isOpen={this.state.discountsOpen[i]}
                                                    toggle={() => {
                                                        const discountsOpen = [...this.state.discountsOpen];
                                                        discountsOpen[i] = !discountsOpen[i];
                                                        this.setState({ discountsOpen })
                                                    }}>
                                                    <DropdownToggle
                                                        caret color="success">
                                                        Frequency Discount
                                                    </DropdownToggle>
                                                    <FormFeedback />
                                                    <DropdownMenu>
                                                        {services.find(srv => srv.id == service.service_id) ? services.find(srv => srv.id == service.service_id).discounts.map(discount => {
                                                            return (
                                                                <DropdownItem
                                                                    onClick={() => chooseDiscount(discount, i)}
                                                                    key={discount.id}
                                                                    className="messages-dropdown-item"
                                                                    value={discount.id}>{discount.label}</DropdownItem>
                                                            )
                                                        }) : <DropdownItem />}
                                                    </DropdownMenu>
                                                </Dropdown>
                                            </Col>
                                            {service.discount &&
                                                <Col md={12} className="p-0 d-flex mb-2">
                                                    <Col md={4} key="label" className="d-flex align-items-center">
                                                        <Label>
                                                            {service.discount.label}
                                                        </Label>
                                                    </Col>
                                                    <Col md={7}>
                                                        <InputGroup key="m">
                                                            <InputGroupAddon
                                                                addonType="prepend">{service.discount.type === "f" ? "$" : "%"}</InputGroupAddon>
                                                            <Input
                                                                name={i}
                                                                disabled
                                                                value={service.discount.value}
                                                                placeholder="Discount" />
                                                        </InputGroup>
                                                    </Col>
                                                    <Col md={1} className="d-flex justify-content-end">
                                                        <Button
                                                            color="danger"
                                                            className=" d-flex justify-content-center"
                                                            onClick={() => removeDiscount(i)}
                                                        ><Icon icon={faTrash} /></Button>
                                                    </Col>
                                                </Col>}
                                            <FormFeedback />
                                        </Col>
                                    )
                                })
                            }
                            <Col md={12} className="p-0 mb-2">
                                <Button onClick={() => this.props.addService()} color="link">Add Service</Button>
                            </Col>
                            <Col md={12} className="d-flex align-items-center p-0 mb-2">
                                <InputField label="Discount Description: "
                                    name="discount.label"
                                    maxLength={20}
                                    value={appointment.discount.label}
                                    error={this.error("discount.label")}
                                    handleFormInput={handleFormInput} />
                            </Col>
                            <Col md={12} className="d-flex align-items-center p-0 mb-2">
                                <Col md={4}>
                                    <Label> {appointment.discount.label}: </Label>
                                </Col>
                                <Col md={8} className="d-flex align-items-center p-0">
                                    <Col md={4} className="mr-0 pr-0">
                                        <Input type="select"
                                            value={appointment.discount.type}
                                            onChange={(e) => handleFormInput("discount.type", e.target.value)}
                                            className="w-100">
                                            <option value="p">%</option>
                                            <option value="f">$</option>
                                        </Input>
                                    </Col>
                                    <Col md={8} className="ml-0 pl-0">
                                        <Input
                                            value={appointment.discount.value ? appointment.discount.value / 100 : ""}
                                            onChange={(e) => handleFormInput("discount.value", e.target.value * 100)}
                                        />
                                    </Col>
                                </Col>
                            </Col>
                            <Col md={12} className="d-flex align-items-center p-0 mb-2">
                                <Col md={4} className="d-flex align-items-center">
                                    <Label>
                                        <span>Deposit</span>
                                    </Label>
                                </Col>
                                <Col md={8}>
                                    <InputGroup id="deposit">
                                        <InputGroupAddon addonType="prepend">$</InputGroupAddon>
                                        <Input disabled={appointment.deposit.paid}
                                            value={appointment.deposit.amount > 0 ? appointment.deposit.amount / 100 : ""}
                                            type="number"
                                            onChange={(e) => handleFormInput("deposit.amount", e.target.value * 100)} />
                                        <FormFeedback>{this.error("deposit")}</FormFeedback>
                                    </InputGroup>
                                    {appointment.deposit.paid && <Tooltip placement="right" isOpen={this.state.tooltipOpen} target="deposit" toggle={() => this.toggle()}>
                                        Deposit Paid
                                    </Tooltip>}
                                </Col>
                            </Col>
                            <Col md={12} className="d-flex align-items-center p-0 mb-2">
                                <InputField handleFormInput={(a, b, c) => this.props.handleTimeInput(a, b, c, 0)}
                                    key="duration"
                                    required
                                    //error={this.error("rules.0.duration")}
                                    label={"Duration"} name={"duration"}
                                    value={appointment.duration}
                                    type="time" />
                            </Col>
                            <FormFeedback />
                            <Col md={12} className="d-flex align-items-center p-0 mb-2">
                                <InputField label="Tax"
                                    append="%"
                                    value={appointment.tax}
                                    name="tax"
                                    error={this.error("tax")}
                                    type="number"
                                    handleFormInput={handleFormInput} required />
                            </Col>
                            <Col md={12} className="d-flex align-items-center p-0 mb-2">
                                <InputField
                                    disabled
                                    label="Total"
                                    prepend="$"
                                    value={(appointment.total / 100).toFixed(2)}
                                    name="total"
                                    type="number" />
                            </Col>
                        </TabPane>
                        <TabPane tabId={2}>
                            <Col md={12} className="p-0 mb-2 mt-2">
                                <Col md={12}>
                                    <Label>
                                        Note:
                                    </Label>
                                </Col>
                                <Col md={12}>
                                    <Input type="textarea"
                                        value={appointment.note}
                                        maxLength="190"
                                        name="note"
                                        onChange={(e) => handleFormInput("note", e.target.value)} />
                                    <span>{appointment.note ? appointment.note.length : 0}/190</span>
                                </Col>
                            </Col>
                        </TabPane>
                        <TabPane tabId={3}>
                            History
                        </TabPane>
                    </TabContent>
                </Col>
            </Row>
        )
    }
}


export default BookingInfoForm;
