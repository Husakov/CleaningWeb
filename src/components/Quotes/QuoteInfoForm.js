import React, {Fragment} from 'react';
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
    Row
} from "reactstrap";
import Icon from '@fortawesome/react-fontawesome'
import { faTrash } from "@fortawesome/fontawesome-free-solid/shakable.es";
import InputField from "../InputField";
import MultipleSelectDropdown from '../MultipleSelectDropdown';
import { getError, setDeepProp } from "../../util";
import Select from '@kemoke/react-select';
import CustomerModel from '../../model/customer'

class QuoteInfoForm extends React.Component {
    state = {
        discountsOpen: this.props.quote.appointment.appointment_services.map((service) => false),
        addAddress: false,
        addCustomer: false,
        address: "",
        city: "",
        zip: "",
        customer: new CustomerModel()
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
    }

    error(name) {
        if (!this.props.errors) return undefined;
        return getError(this.props.errors, name);
    }

    render() {
        const {
            quote, handleFormInput, handleServiceChange,
            handlePricingChange, handleAddonChange,
            addPricing, addAddon, depositEnabled,
            depositToggle, services, chooseDiscount, removeDiscount
        } = this.props;
        return (
            <Row>
                <Col className="d-flex input-row mb-2" md={12}>

                </Col>
                <InputField label="Quote Title"
                    handleFormInput={handleFormInput}
                    value={quote.title}
                    name="title"
                    error={this.error("title")}
                    required />
                <InputField
                    label="Quote Template"
                    name="template"
                    type="multi-select"
                    required
                    error={this.error("quote_template_id")} />
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
                            value={this.props.quote.appointment.customer_id}
                            onChange={e => this.props.handleCustomerChange(this.props.customers, e ? e.value : null)}
                            labelKey={"name"}
                            options={this.props.customers.map(customer => {
                                return { value: customer.id, name: customer.first_name + " " + customer.last_name }
                            })}
                        />
                        <FormFeedback >{this.error("appointment.customer_id")}</FormFeedback>
                    </Col>
                </Col>
                <Col md={12} className="p-0">
                    <Button color="link" onClick={() => this.setState({ addCustomer: !this.state.addCustomer })}>Add new
                        Customer</Button>
                </Col>
                {this.state.addCustomer &&
                    <Col md={12} className="p-0">
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
                            name="customer"
                            value={this.props.quote.appointment.address}
                            onChange={(e) => this.props.selectAddress(e ? e.value : null)}
                            labelKey={"name"}
                            options={this.props.addressList.map(address => {
                                return { value: address, name: address }
                            })}
                        />
                        <FormFeedback>{this.error("billing_address")}</FormFeedback>
                    </Col>
                </Col>
                {this.props.quote.appointment.customer_id && <Col md={12} className="p-0">
                    <Button color="link" onClick={() => this.setState({ addAddress: !this.state.addAddress })}>Add new address</Button>
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

                <InputField label="Expiration Date"
                    value={quote.expiration}
                    handleFormInput={handleFormInput}
                    required
                    name="expiration" type="date" />
                {quote.appointment.appointment_services.map((service, i) => {
                    return (
                        <Col md={12} className="p-0" key={i}>
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
                                        value={service.id}
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
                                                    name={i}
                                                    type="number"
                                                    onChange={(e) => handlePricingChange(e.target.value, "quantity", i, j)}
                                                    value={pricing.quantity}
                                                    placeholder="Quantity" />
                                                <Input
                                                    name={i}
                                                    type="number"
                                                    onChange={(e) => handlePricingChange(e.target.value, "price", i, j)}
                                                    value={pricing.price > 0 ? pricing.price / 100 : ""}
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
                                        })
                                        return { ...addon, checked, name: addon.title }
                                    }) : []}
                                />
                            </Col>
                            {service.add_ons.map((addon, j) => {
                                return (
                                    <Fragment key={j}>
                                    <Col md={12} className="p-0 d-flex mb-2">
                                        <Col md={4} key="label" className="d-flex align-items-center">
                                            <Label>
                                                {addon.title}
                                            </Label>
                                        </Col>
                                        <Col md={7} className="d-flex">
                                            <Input
                                                name={i}
                                                type="number"
                                                onChange={(e) => handleAddonChange(e.target.value, "quantity", i, j)}
                                                value={addon.quantity}
                                                placeholder="Quantity" />
                                            <Input
                                                name={i}
                                                type="number"
                                                onChange={(e) => handleAddonChange(e.target.value, "price", i, j)}
                                                value={addon.price > 0 ? addon.price / 100 : ""}
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
                                            <InputGroupAddon addonType="prepend">{service.discount.type === "f" ? "$" : "%"}</InputGroupAddon>
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
                            <FormFeedback></FormFeedback>
                        </Col>
                    )
                })}

                <Col md={12} className="p-0 mb-2">
                    <Button onClick={() => this.props.addService()} color="link">Add Service</Button>
                </Col>
                <InputField label="Discount Description"
                    value={quote.appointment.discount.label}
                    handleFormInput={handleFormInput}
                    name="appointment.discount.label"
                    error={this.error("discount_description")}
                    required />
                <Col md={12} className="d-flex align-items-center p-0 mb-2">
                    <Col md={4}>
                        <Label> {this.props.quote.appointment.discount.label}: </Label>
                    </Col>
                    <Col md={8} className="d-flex align-items-center p-0">
                        <Col md={4} className="mr-0 pr-0">
                            <Input type="select"
                                value={quote.appointment.discount.type}
                                onChange={(e) => handleFormInput("appointment.discount.type", e.target.value)}
                                className="w-100">
                                <option value="p">%</option>
                                <option value="f">$</option>
                            </Input>
                        </Col>
                        <Col md={8} className="ml-0 pl-0">
                            <Input
                                value={quote.appointment.discount.value}
                                onChange={(e) => handleFormInput("appointment.discount.value", e.target.value)}
                            />
                        </Col>
                    </Col>
                </Col>
                <FormFeedback />
                <InputField label="Tax"
                    append="%"
                    value={quote.appointment.tax}
                    name="appointment.tax"
                    error={this.error("tax")}
                    type="number"
                    handleFormInput={handleFormInput} required />
                <Col md={4} className="d-flex align-items-center" >
                    <Label>
                        <span>Deposit</span>
                        <span className="pl-4 pt-2">
                            <Input
                                onChange={depositToggle}
                                checked={depositEnabled}
                                type="checkbox" /></span>
                    </Label>
                </Col>

                <Col md={8}>
                    <InputGroup>
                        <InputGroupAddon addonType="prepend">$</InputGroupAddon>
                        <Input disabled={!depositEnabled} value={quote.appointment.deposit.amount > 0 ? quote.appointment.deposit.amount / 100 : ""}
                            type="number"
                            onChange={(e) => handleFormInput("appointment.deposit.amount", e.target.value * 100)} />

                        <FormFeedback>{this.error("deposit")}</FormFeedback>
                    </InputGroup>
                </Col>
                <div className="ml-2" style={{ fontSize: '12px', color: 'red' }}>{this.error("quote_pricings")}</div>
            </Row>
        )
    }
}


export default QuoteInfoForm;
