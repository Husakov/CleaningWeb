import React from 'react';
import {
    Button,
    Col,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row
} from "reactstrap";
import QuoteInfoForm from '../../components/Quotes/QuoteInfoForm';
import QuotePreview from '../../components/Quotes/QuotePreview';
import SendEmail from '../../components/Quotes/SendEmail';
import { connect } from "react-redux";
import { setDeepProp } from "../../util";
import { bindActionCreators } from "redux";
import { getList } from '../../reducers/serviceReducer';
import {
    addProperty,
    createCustomer,
    createQuote,
    editQuote,
    getCustomers,
    sendMail
} from '../../reducers/quotesReducer';
import QuoteModel from '../../model/quote';
import Icon from '@fortawesome/react-fontawesome'
import { faCaretDown, faEnvelope, faSync } from "@fortawesome/fontawesome-free-solid/shakable.es";
import { toast } from "react-toastify";
import { mailTemplate } from '../../api';

class CreateQuoteDialog extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            quote: new QuoteModel(),
            addons: [],
            total: 0,
            actionsOpen: false,
            sendEmail: false,
            depositEnabled: true,
            addressList: [],
            fromEmail: false,
            tags: []
        }
    }

    async componentWillMount() {
        this.props.getServices(this.props.user.selectedCompany.id);
        this.props.getCustomers(this.props.user.selectedCompany.id);
        const tags = await mailTemplate(this.props.user.selectedCompany.id).tags();
        this.setState({ tags });
    };

    componentWillReceiveProps(newProps) {
        let newQuote = { ...newProps.quote };
        if (this.props.quote.id !== newProps.quote.id || newProps.quote.id === -1) {
            let newQuote = { ...newProps.quote }
            if (newQuote.id === -1 && this.props.services[0]) {
                newQuote.appointment.appointment_services[0].service_id = this.props.services[0].id;
                newQuote.appointment.appointment_services[0].name = this.props.services[0].name;
            }
            const total = 0;
            this.handleCustomerChange(newProps.customers, newQuote.customer_id);
            this.setState({ quote: new QuoteModel(newQuote) });
        }
        if (this.props.request.fulfilled === false && newProps.request.fulfilled === true && this.props.isOpen) {
            if (this.props.quote.id == -1)
                this.setState({ quote: new QuoteModel(newProps.quotes[0]) });
        }
        if (this.props.request.fulfilled === false && newProps.request.fulfilled === true && this.props.isOpen) {
            if (this.state.fromEmail)
                this.setState({ sendEmail: true, fromEmail: false })

            else {
                this.props.toggle();
                this.setState({ quote: new QuoteModel() });
                toast.success(this.props.quote.id == -1 ? "Quote Created" : "Quote Edited");
            }
        }
        if (this.props.emailReq.fulfilled === false && newProps.emailReq.fulfilled === true && this.props.isOpen && this.state.sendEmail) {
            this.setState({ sendEmail: false, quote: new QuoteModel() }, () => this.props.toggle())
            toast.success("Mail Sent");
        }
        if (!this.props.customerReq.fulfilled && newProps.customerReq.fulfilled)
            this.handleCustomerChange(newProps.customers, newProps.customers[newProps.customers.length - 1].id);
    };

    handleServiceChange = (id, i) => {
        const service = this.props.services.find(service => service.id == id);
        const appointment = { ...this.state.quote.appointment };
        appointment.appointment_services[i] = {
            service_id: id,

            name: service.name,
            service_pricings: [],
            add_ons: []
        };
        this.setState({ quote: { ...this.state.quote, appointment } });

    };
    handleCustomerChange = (customers, customer_id) => {
        const customer = customers.find(customer => customer.id == customer_id);
        const addressList = [];
        let address = this.state.quote.appointment.address;
        if (customer) {
            if (customer.address)
                addressList.push(customer.address + ", " + customer.city + ", " + customer.zip);
            if (customer.address2)
                addressList.push(customer.address2 + ", " + customer.city + ", " + customer.zip);
            customer.properties.forEach(prop => addressList.push(prop.name));
            if (addressList.length > 0 && address.length < 1)
                address = addressList[0];
            this.setState({ addressList, quote: { ...this.state.quote, appointment: { ...this.state.quote.appointment, customer_id, customer, address: address } } });

        }
    };
    selectAddress = (address) => {
        this.setState({ quote: { ...this.state.quote, appointment: { ...this.state.quote.appointment, address } } });
    };
    chooseDiscount = (discount, i) => {
        const appointment = { ...this.state.quote.appointment };
        appointment.appointment_services[i].discount = discount;
        appointment.appointment_services[i].discount_id = discount.id;
        this.setState({ quote: { ...this.state.quote, appointment } });
    }
    handleFormInput = (field, data) => {
        const quote = this.state.quote;
        if (field.indexOf(".") !== -1) {
            const fields = field.split(".");
            setDeepProp(quote, data, fields);
        } else {
            quote[field] = data;
        }
        this.setState({ quote });
    };
    handlePricingChange = (value, type, i, j) => {
        const appointment = { ...this.state.quote.appointment };
        appointment.appointment_services[i].service_pricings[j][type] = value;
        if (type === "quantity") {
            const service = this.props.services.find(service => service.id == appointment.appointment_services[i].service_id);
            const pricing = service.pricings.find(pricing => pricing.id == appointment.appointment_services[i].service_pricings[j].id);
            appointment.appointment_services[i].service_pricings[j]["price"] = this.calculatePricingPrice(
                pricing, value
            );
        }
        else
            appointment.appointment_services[i].service_pricings[j][type] = Math.round(value * 100);

        this.setState({ quote: { ...this.state.quote, appointment } })
    };
    handleAddonChange = (value, type, i, j) => {
        const appointment = { ...this.state.quote.appointment };
        appointment.appointment_services[i].add_ons[j][type] = value;

        if (type === "quantity") {
            const service = this.props.services.find(service => service.id == appointment.appointment_services[i].service_id);
            const addon = service.addons.find(a => a.id == appointment.appointment_services[i].add_ons[j].id);
            appointment.appointment_services[i].add_ons[j]["price"] = this.calculateAddonPrice(
                addon, value
            );
        }
        else
            appointment.appointment_services[i].add_ons[j][type] = Math.round(value * 100);
        this.setState({ quote: { ...this.state.quote, appointment } })
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
        return price * 100;
    };
    calculateAddonPrice = (addon, value) => {
        let price = 0;
        addon.rules.forEach(rule => {
            if (rule['from'] <= value && rule['to'] >= value)
                price = value * rule['value'];
        })
        return price * 100;
    };
    addService = () => {
        const appointment = { ...this.state.quote.appointment };
        appointment.appointment_services.push({ name: this.props.services[0].name, service_id: this.props.services[0].id, discount: {}, service_pricings: [], add_ons: [] });
        this.setState({ quote: { ...this.state.quote, appointment } })
    }

    async componentWillMount() {
        this.props.getServices(this.props.user.selectedCompany.id);
        this.props.getCustomers(this.props.user.selectedCompany.id);
        const tags = await mailTemplate(this.props.user.selectedCompany.id).tags();
        this.setState({ tags });
    };

    removeService(i) {
        const appointment = { ...this.state.quote.appointment };
        appointment.appointment_services.splice(i, 1);
        this.setState({ quote: { ...this.state.quote, appointment } })
    }

    removeDiscount(i) {
        const appointment = { ...this.state.quote.appointment };
        delete appointment.appointment_services[i].discount;
        delete appointment.appointment_services[i].discount_id;
        this.setState({ quote: { ...this.state.quote, appointment } })
    }
    addPricing = (pricing, i) => {
        const appointment = { ...this.state.quote.appointment };
        const index = appointment.appointment_services[i].service_pricings.findIndex(p => pricing.id === p.id);
        appointment.appointment_services[i].service_pricings.push({ unit: pricing.unit, id: pricing.id, quantity: 0, price: 0 });
        this.setState({ quote: { ...this.state.quote, appointment } })
    }

    removePricing(i, j) {
        const appointment = { ...this.state.quote.appointment };
        appointment.appointment_services[i].service_pricings.splice(j, 1);
        this.setState({ quote: { ...this.state.quote, appointment } })
    }

    togglePricing(pricing, i) {
        const appointment = { ...this.state.quote.appointment };
        let index = appointment.appointment_services[i].service_pricings.findIndex(p => pricing.id === p.id);
        if (index === -1)
            this.addPricing(pricing, i);
        else this.removePricing(i, index);
    }
    addAddon = (addon, i) => {
        const appointment = { ...this.state.quote.appointment };
        appointment.appointment_services[i].add_ons.push({ title: addon.title, id: addon.id, quantity: 0, price: 0 });
        this.setState({ quote: { ...this.state.quote, appointment } })
    }
    removeAddon(i, j) {
        const appointment = { ...this.state.quote.appointment };
        appointment.appointment_services[i].add_ons.splice(j, 1);
        this.setState({ quote: { ...this.state.quote, appointment } })
    }

    toggleAddon(addon, i) {
        const appointment = { ...this.state.quote.appointment };
        let index = appointment.appointment_services[i].add_ons.findIndex(p => addon.id === p.id);
        if (index === -1)
            this.addAddon(addon, i);
        else this.removeAddon(i, index);
    }

    createQuote() {
        let quote = { ...this.state.quote };
        quote.appointment.appointment_services.forEach(service => {
            service.service_pricings.forEach(pricing => {
                if (!(pricing.price > 0))
                    pricing.price = 0;
                if (!(pricing.quantity > 0))
                    pricing.quantity = 0;
            });
            service.add_ons.forEach(pricing => {
                if (!(pricing.price > 0))
                    pricing.price = 0;
                if (!(pricing.quantity > 0))
                    pricing.quantity = 0;
            })
        })
        this.state.quote.id === -1 ? this.props.create(this.props.user.selectedCompany.id, quote) :
            this.props.edit(this.props.user.selectedCompany.id, this.state.quote.id, quote);
    }

    openMail() {
        this.setState({ fromEmail: true }, () => this.createQuote())
    }

    editCustomer(customeradd) {
        this.props.addProperty(this.state.quote.appointment.customer.id, { name: customeradd.address + ", " + customeradd.city + ", " + customeradd.zip });
        const addressList = [...this.state.addressList];
        addressList.push(customeradd.address + ", " + customeradd.city + ", " + customeradd.zip);
        this.setState({
            quote: {
                ...this.state.quote,
                appointment: { ...this.state.quote.appointment, address: customeradd.address + ", " + customeradd.city + ", " + customeradd.zip }
            }, addressList
        });
    }

    render() {
        const { toggle, isOpen, request, customers } = this.props;
        return (
            <Modal toggle={toggle}
                isOpen={isOpen} size="lg" style={{ minWidth: "70%" }}>
                <ModalHeader toggle={toggle}>{this.state.quote.id === -1 ? "Create Quote" : "Edit Quote"}</ModalHeader>
                <ModalBody style={{ minHeight: 100 }}>
                    <Row className="d-flex">
                        <Col md={7} xs={12}>
                            <QuoteInfoForm
                                errors={this.props.errors}
                                company_id={this.props.user.selectedCompany.id}
                                services={this.props.services}
                                quote={this.state.quote}
                                handleFormInput={this.handleFormInput}
                                handleServiceChange={this.handleServiceChange}
                                handlePricingChange={this.handlePricingChange}
                                handleAddonChange={this.handleAddonChange}
                                handleCustomerChange={(customers, customer) => this.handleCustomerChange(customers, customer)}
                                togglePricing={(pricing, i) => this.togglePricing(pricing, i)}
                                toggleAddon={(addon, i) => this.toggleAddon(addon, i)}
                                chooseDiscount={(discount, i) => this.chooseDiscount(discount, i)}
                                removePricing={(i, j) => this.removePricing(i, j)}
                                removeAddon={(i, j) => this.removeAddon(i, j)}
                                customers={customers}
                                depositEnabled={this.state.depositEnabled}
                                depositToggle={() => this.setState({ depositEnabled: !this.state.depositEnabled })}
                                addressList={this.state.addressList}
                                displayedAddress={this.state.displayedAddress}
                                selectAddress={this.selectAddress}
                                createCustomer={(customer) => this.props.createCustomer(customer)}
                                customerReq={this.props.customerReq}
                                editCustomer={(customer) => this.editCustomer(customer)}
                                addService={() => this.addService()}
                                removeService={(i) => this.removeService(i)}
                                removeDiscount={(i) => this.removeDiscount(i)}
                            />
                        </Col>
                        <Col md={5} xs={12}>
                            <QuotePreview
                                quote={this.state.quote}
                                customers={customers}
                                total={this.state.total}
                                displayedAddress={this.state.displayedAddress}
                                depositEnabled={this.state.depositEnabled} />
                        </Col>
                    </Row>
                </ModalBody>
                <Modal size="lg" style={{ minWidth: "70%" }} isOpen={this.state.sendEmail}
                    toggle={() => this.setState({ sendEmail: false })}>
                    <ModalHeader toggle={() => this.setState({ sendEmail: false, quote: new QuoteModel() })}>Send
                        Email</ModalHeader>
                    <ModalBody>
                        <SendEmail
                            customers={customers}
                            user={this.props.user}
                            tags={this.state.tags}
                            quote={this.state.quote}
                            sendMail={this.props.sendMail}
                            errors={this.props.emailError}
                            request={this.props.emailReq}
                            selectedCustomer={this.state.quote.appointment.customer_id} />
                    </ModalBody>
                </Modal>
                <ModalFooter>
                    <Button disabled={request.pending} color="success" onClick={() => this.createQuote()}>
                        {request.pending ? <Icon spin icon={faSync} /> : ''}
                        Save Quote</Button>
                    <Dropdown
                        isOpen={this.state.actionsOpen}
                        toggle={() => this.setState({ actionsOpen: !this.state.actionsOpen })}>
                        <DropdownToggle
                            color="success">
                            <Icon icon={faCaretDown} />
                        </DropdownToggle>
                        <DropdownMenu>
                            <DropdownItem
                                style={{ cursor: 'pointer' }}
                                onClick={() => this.openMail()}
                            ><Icon icon={faEnvelope}
                                /> Save and Email Quote</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </ModalFooter>
            </Modal>
        )
    }
}


function mapState(state) {
    return {
        services: state.service.services,
        user: state.user,
        errors: state.quotes.errors,
        customerErrors: state.quotes.customerErrors,
        customers: state.quotes.customers,
        request: state.quotes.request,
        emailReq: state.quotes.emailReq,
        emailError: state.quotes.emailError,
        customerReq: state.quotes.customerReq,
        customerErrors: state.quotes.customerErrors,
        quotes: state.quotes.data.quotes
    }
}

function mapDispatch(dispatch) {
    return bindActionCreators({
        getServices: getList,
        create: createQuote,
        edit: editQuote,
        getCustomers,
        createCustomer,
        addProperty,
        sendMail
    }, dispatch)
}

export default connect(mapState, mapDispatch)(CreateQuoteDialog)
