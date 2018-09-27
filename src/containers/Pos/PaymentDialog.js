import React from 'react';
import {
    Button,
    FormGroup,
    Input,
    InputGroup,
    InputGroupAddon,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader
} from "reactstrap";
import {CardCVCElement, CardExpiryElement, CardNumberElement, Elements, injectStripe,} from "react-stripe-elements";
import './style.css';
import DatePicker from "react-datepicker";
import moment from "moment/moment";

const StripeForm = injectStripe(React.forwardRef(({onSubmit, stripe}, ref) => (
    <form onSubmit={e => onSubmit(e, stripe)} ref={ref}>
        <div>
            <Label>Card number</Label>
            <CardNumberElement className="form-control payment-input"/>
        </div>
        <div>
            <Label>Expiration Date</Label>
            <CardExpiryElement className="form-control"/>
        </div>
        <div>
            <Label>CVC</Label>
            <CardCVCElement className="form-control"/>
        </div>
    </form>
)));

class PaymentDialog extends React.Component {

    onSubmit = async (e, stripe) => {
        e.preventDefault();
        const {invoice} = this.props;
        const {customer} = invoice;
        const token = await stripe.createToken({
            name: `${customer.first_name} ${customer.last_name}`,
            email: customer.email
        });
    };

    state = {
        paymentType: "stripe",
        amount: 0,
        date: moment(),
        reference: ""
    };
    form = React.createRef();
    inputChange = e => {
        this.setState({[e.target.name]: e.target.value});
    };
    dateChange = date => {
        this.setState({date});
    };

    componentDidUpdate(oldProps) {
        if (this.props.invoice.id !== oldProps.invoice.id) {
            this.setState({amount: this.props.invoice.amount, reference: "", date: moment()});
        }
    }

    render() {
        const {isOpen, toggle} = this.props;
        const {paymentType, amount, date, reference} = this.state;
        return (
            <Modal isOpen={isOpen} toggle={toggle}>
                <ModalHeader toggle={toggle}>
                    Payment Form
                </ModalHeader>
                <ModalBody>
                    <FormGroup>
                        <Label for="paymentType">Payment Type</Label>
                        <Input type="select" value={paymentType} onChange={this.inputChange} name="paymentType">
                            <option value="stripe">Stripe</option>
                            <option value="paypal">Paypal</option>
                        </Input>
                    </FormGroup>
                    {paymentType === "stripe" &&
                    <Elements>
                        <StripeForm onSubmit={this.onSubmit} ref={this.form}/>
                    </Elements>
                    }
                    <FormGroup>
                        <Label for="amount">Amount</Label>
                        <InputGroup>
                            <InputGroupAddon addonType="prepend">$</InputGroupAddon>
                            <Input type="number" value={amount} onChange={this.inputChange} name="amount"/>
                        </InputGroup>
                    </FormGroup>
                    <FormGroup>
                        <Label for="date">Payment Date</Label>
                        <DatePicker selected={date} onChange={this.dateChange} className="form-control"/>
                    </FormGroup>
                    <FormGroup>
                        <Label for="reference">Reference</Label>
                        <Input type="text" value={reference} onChange={this.inputChange} name="reference"/>
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button color="success" className="mt-3">Pay</Button>
                </ModalFooter>
            </Modal>
        )
    }
}

export default PaymentDialog;
