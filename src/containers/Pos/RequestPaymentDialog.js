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
import {toast} from "react-toastify";
import Select from "@kemoke/react-select";

class RequestPaymentDialog extends React.Component {

    state = {
        amount: 0,
        message: "",
        emails: []
    };
    inputChange = e => {
        this.setState({[e.target.name]: e.target.value});
    };
    selectChange = e => {
        console.log(e.map(e => e.value));
        this.setState({emails: e.map(e => e.value)})
    };
    copyUrl = () => {
        const textField = document.createElement('textarea');
        textField.innerText = this.props.invoice.url;
        document.body.appendChild(textField);
        textField.select();
        document.execCommand('copy');
        textField.remove();
        toast.info("Copied url to clipboard");
    };

    componentDidUpdate(oldProps) {
        if (this.props.invoice.id !== oldProps.invoice.id) {
            this.setState({
                amount: this.props.invoice.amount,
                emails: this.props.invoice.customer.email ? [this.props.invoice.customer.email] : [],
                message: ""
            });
        }
    }

    render() {
        const {isOpen, toggle} = this.props;
        const {amount, message, emails} = this.state;
        return (
            <Modal toggle={toggle} isOpen={isOpen}>
                <ModalHeader toggle={toggle}>
                    Request Payment
                </ModalHeader>
                <ModalBody>
                    <FormGroup>
                        <Label for="amount">Amount</Label>
                        <InputGroup>
                            <InputGroupAddon addonType="prepend">$</InputGroupAddon>
                            <Input type="number" value={amount} onChange={this.inputChange} name="amount"/>
                        </InputGroup>
                    </FormGroup>
                    <FormGroup>
                        <Label for="email">E-Mail</Label>
                        <Select.Creatable multi type="email" value={emails.map(e => ({value: e, label: e}))}
                                          onChange={this.selectChange} name="email"/>
                    </FormGroup>
                    <FormGroup>
                        <Label for="message">Message</Label>
                        <Input type="textarea" rows="5" value={message} onChange={this.inputChange} name="message"/>
                    </FormGroup>
                    <FormGroup>
                        <Label for="message">Url</Label>
                        <InputGroup>
                            <Input type="text" value={this.props.invoice.url} readOnly name="message"/>
                            <InputGroupAddon addonType="append"><Button
                                onClick={this.copyUrl}>Copy</Button></InputGroupAddon>
                        </InputGroup>
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button color="success">Request Payment</Button>
                </ModalFooter>
            </Modal>
        )
    }

}

export default RequestPaymentDialog;
