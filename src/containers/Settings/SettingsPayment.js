import React, { Component } from 'react';
import './SettingsPayment.css';
import Toggle from '../../components/Toggle';
import {
    Collapse,
    Button,
    CardBody,
    Card,
    ListGroup,
    ListGroupItem,
    FormGroup,
    Label,
    Col,
    Input,
    Tooltip,
    UncontrolledTooltip, InputGroupAddon, InputGroup
} from 'reactstrap';
import Icon from '@fortawesome/react-fontawesome'
import {
    faInfoCircle, faChevronDown, faSync
} from "@fortawesome/fontawesome-free-solid/shakable.es";
import classSet from "react-classset";


class SettingsPayment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: 'payment',
            payLocally: true,
            payPal: false,
            guestPay: false,
            testMode: true,
            authorizeNET: false,
            sandboxMode: true,
            stripe: false,
            toggledValue: false,
            collapse: false,
            //drops
            payLocallyDrop: false,
            paypalDrop: false,
            stripeDrop: false,
            //inputs
            paypalUsername: '',
            paypalPassword: '',
            paypalSignature: '',
            authLoginID: '',
            authTransKey: '',
            stripSecretKey: '',
            stripPublicKey: '',
            deposit: true,
            depositAmount: 0,
            tax: 15,
            //tooltips
            userTooltip: false,
            passTooltip: false,
            signTooltip: false,
            guestTooltip: false,
            testTooltip: false,
            sandboxTooltip: false,
        }
    }

    componentWillMount() {
        if (this.props.company.payment_settings) {
            const { payment_settings } = this.props.company;
            this.setState({
                tax: payment_settings.tax_percent,
                depositAmount: payment_settings.deposit_amount,
                payLocally: payment_settings.enable_local_payment,
                payPal: payment_settings.enable_paypal_payment,
                stripe: payment_settings.enable_stripe_payment,
            });
        }
        ;
    }

    toggleValue = () => {
        this.setState({ toggledValue: !this.state.toggledValue });
    }
    toggleCollapse = () => {
        this.setState({ collapse: !this.state.collapse });
    }

    savePayment = () => {
        let payment = {
            stripe_pk: this.state.stripPublicKey,
            stripe_sk: this.state.stripSecretKey,
            tax_percent: this.state.tax,
            deposit_amount: this.state.depositAmount,
            enable_local_payment: this.state.payLocally,
            enable_paypal_payment: this.state.payPal,
            enable_stripe_payment: this.state.stripe,
        };
        this.props.editPayment(this.props.company.id, payment);
    }

    render() {
        return (
            <div className='Settings-Payment'>
                <ListGroup>
                    <ListGroupItem>
                        <span>Pay Locally</span>
                        <div className='d-flex align-items-center'>
                            <Toggle
                                className=''
                                value={this.state.payLocally}
                                activeText={'Enabled'}
                                inactiveText={'Disabled'}
                                onClick={() => this.setState({ payLocally: !this.state.payLocally })}
                            />
                            <Button color="link"
                                style={{ height: "30px", width: "30px", fontSize: "12px", marginLeft: '1em' }}
                                className={classSet({
                                    'btn-round-border text-dark d-flex align-items-center justify-content-center"': true,
                                    'fa-rotate-180': this.state.payLocallyDrop
                                })} onClick={() => this.setState({ payLocallyDrop: !this.state.payLocallyDrop })}><Icon icon={faChevronDown} />
                            </Button>
                        </div>
                    </ListGroupItem>
                    <br />
                    <ListGroupItem>
                        <span>Paypal Express Checkout</span>
                        <div className="d-flex align-items-center">
                            <Toggle
                                className='float-right'
                                value={this.state.payPal}
                                activeText={'Enabled'}
                                inactiveText={'Disabled'}
                                onClick={() => this.setState({ payPal: !this.state.payPal })}
                            />
                            <Button color="link"
                                style={{ height: "30px", width: "30px", fontSize: "12px", marginLeft: '1em' }}
                                className={classSet({
                                    'btn-round-border text-dark d-flex align-items-center justify-content-center"': true,
                                    'fa-rotate-180': this.state.paypalDrop
                                })} onClick={() => this.setState({ paypalDrop: !this.state.paypalDrop })}><Icon icon={faChevronDown} />
                            </Button>
                        </div>
                    </ListGroupItem>
                    <Collapse className='pay-card' isOpen={this.state.paypalDrop}>
                        <Card>
                            <CardBody>
                                <FormGroup row>
                                    <Label for="api-username" sm={2}>Username:</Label>
                                    <Col sm={5}>
                                        <Input type="text" name="api-username" id="api-username"
                                            placeholder="API username"
                                            onFocus={(e) => e.target.placeholder = ''}
                                            onBlur={(e) => e.target.placeholder = 'API username'}
                                            onChange={(e) => this.setState({ paypalUsername: e.currentTarget.value })}
                                            value={this.state.paypalUsername}

                                        />
                                    </Col>
                                    <Col sm={1} style={{ display: 'flex', alignItems: 'center' }}>
                                        <Icon className='' icon={faInfoCircle} id='user-tooltip' />
                                        <UncontrolledTooltip placement="right" target="user-tooltip">
                                            <small>Paypal API username can get easily from developer.paypal.com
                                                account
                                            </small>
                                        </UncontrolledTooltip>
                                    </Col>
                                </FormGroup>
                                <FormGroup row>
                                    <Label for="api-password" sm={2}>Password:</Label>
                                    <Col sm={5}>
                                        <Input type="password" name="api-password" id="api-password"
                                            placeholder="API password"
                                            onFocus={(e) => e.target.placeholder = ''}
                                            onBlur={(e) => e.target.placeholder = 'API password'}
                                            onChange={(e) => this.setState({ paypalPassword: e.currentTarget.value })}
                                            value={this.state.paypalPassword}


                                        />
                                    </Col>
                                    <Col sm={1} style={{ display: 'flex', alignItems: 'center' }}>
                                        <Icon className='' icon={faInfoCircle} id='pass-tooltip' />
                                        <UncontrolledTooltip placement="right" target="pass-tooltip">
                                            <small>Paypal API password can get easily from developer.paypal.com
                                                account
                                            </small>
                                        </UncontrolledTooltip>
                                    </Col>
                                </FormGroup>
                                <FormGroup row>
                                    <Label for="signature" sm={2}>Signature:</Label>
                                    <Col sm={5}>
                                        <Input type="text" name="signature" id="signature"
                                            placeholder="signature"
                                            onFocus={(e) => e.target.placeholder = ''}
                                            onBlur={(e) => e.target.placeholder = 'signature'}
                                            onChange={(e) => this.setState({ paypalSignature: e.currentTarget.value })}
                                            value={this.state.paypalSignature}


                                        />
                                    </Col>
                                    <Col sm={1} style={{ display: 'flex', alignItems: 'center' }}>
                                        <Icon className='' icon={faInfoCircle} id='sign-tooltip' />
                                        <UncontrolledTooltip placement="right" target="sign-tooltip">
                                            <small>Paypal API signature can get easily from developer.paypal.com
                                                account
                                            </small>
                                        </UncontrolledTooltip>
                                    </Col>
                                </FormGroup>
                                <FormGroup row>
                                    <Label for="" sm={2}>Guest payment:</Label>
                                    <Col sm={1}>
                                        <Toggle
                                            className=''
                                            value={this.state.guestPay}
                                            activeText={'Enabled'}
                                            inactiveText={'Disabled'}
                                            onClick={() => this.setState({ guestPay: !this.state.guestPay })}
                                        />
                                    </Col>
                                    <Col sm={1} style={{ display: 'flex', alignItems: 'center', marginLeft: '2.5em' }}>
                                        <Icon className='' icon={faInfoCircle} id='guest-tooltip' />
                                        <UncontrolledTooltip placement="right" target="guest-tooltip">
                                            <small>Let user pay through credit card without having a Paypal account
                                            </small>
                                        </UncontrolledTooltip>
                                    </Col>
                                </FormGroup>
                                <FormGroup row>
                                    <Label for="" sm={2}>Test Mode:</Label>
                                    <Col sm={1}>
                                        <Toggle
                                            className=''
                                            value={this.state.testMode}
                                            activeText={'Enabled'}
                                            inactiveText={'Disabled'}
                                            onClick={() => this.setState({ testMode: !this.state.testMode })}
                                        />
                                    </Col>
                                    <Col sm={1} style={{ display: 'flex', alignItems: 'center', marginLeft: '2.5em' }}>
                                        <Icon className='' icon={faInfoCircle} id='test-tooltip' />
                                        <UncontrolledTooltip placement="right" target="test-tooltip">
                                            <small>You can enable Paypal test mode for sandbox account testing</small>
                                        </UncontrolledTooltip>
                                    </Col>
                                </FormGroup>
                            </CardBody>
                        </Card>
                    </Collapse>
                    <br />
                    <ListGroupItem>
                        <span>Stripe Payment Form</span>
                        <div className="d-flex align-items-center">
                            <Toggle
                                className='float-right'
                                value={this.state.stripe}
                                activeText={'Enabled'}
                                inactiveText={'Disabled'}
                                onClick={() => this.setState({ stripe: !this.state.stripe })}
                            />
                            <Button color="link"
                                style={{ height: "30px", width: "30px", fontSize: "12px", marginLeft: '1em' }}
                                className={classSet({
                                    'btn-round-border text-dark d-flex align-items-center justify-content-center"': true,
                                    'fa-rotate-180': this.state.stripeDrop
                                })} onClick={() => this.setState({ stripeDrop: !this.state.stripeDrop })}><Icon icon={faChevronDown} />
                            </Button>
                        </div>
                    </ListGroupItem>
                    <Collapse className='pay-card' isOpen={this.state.stripeDrop}>
                        <Card>
                            <CardBody>
                                <FormGroup row>
                                    <Label for="api-login" sm={2}>Secret Key:</Label>
                                    <Col sm={5}>
                                        <Input type="password" name="secret-key" id="secret-key"
                                            placeholder="Secret Key"
                                            onFocus={(e) => e.target.placeholder = ''}
                                            onBlur={(e) => e.target.placeholder = 'Secret Key'}
                                            onChange={(e) => this.setState({ stripSecretKey: e.currentTarget.value })}
                                            value={this.state.stripSecretKey}


                                        />
                                    </Col>
                                </FormGroup>
                                <FormGroup row>
                                    <Label for="transaction-key" sm={2}>Public Key:</Label>
                                    <Col sm={5}>
                                        <Input type="password" name="public-key" id="public-key"
                                            placeholder="Public Key"
                                            onFocus={(e) => e.target.placeholder = ''}
                                            onBlur={(e) => e.target.placeholder = 'Public Key'}
                                            onChange={(e) => this.setState({ stripPublicKey: e.currentTarget.value })}
                                            value={this.state.stripPublicKey}
                                        />
                                    </Col>
                                </FormGroup>
                            </CardBody>
                        </Card>
                    </Collapse>
                    <br />
                </ListGroup>
                <FormGroup row>
                    <Label for="deposit-amount" sm={2}>Deposit:</Label>
                    <Col sm={5}>
                        <InputGroup>
                            <Input placeholder="0" type="number" step="1"
                                onFocus={(e) => e.target.placeholder = ''}
                                onBlur={(e) => e.target.placeholder = '0'}
                                onChange={(e) => this.setState({ depositAmount: e.currentTarget.value })}
                                value={this.state.depositAmount}
                            />
                            <InputGroupAddon addonType="append">$</InputGroupAddon>
                        </InputGroup>
                    </Col>
                </FormGroup>
                <FormGroup row>
                    <Label for="sc-name" sm={2}>Tax:</Label>
                    <Col sm={5}>
                        <InputGroup>
                            <Input placeholder="15" type="number" step="1"
                                onFocus={(e) => e.target.placeholder = ''}
                                onBlur={(e) => e.target.placeholder = '15'}
                                onChange={(e) => this.setState({ tax: e.currentTarget.value })}
                                value={this.state.tax}
                            />
                            <InputGroupAddon addonType="append">%</InputGroupAddon>
                        </InputGroup>
                    </Col>
                </FormGroup>
                <br />
                <Button disabled={this.props.pending} color="success" onClick={() => this.savePayment()}>{this.props.pending ? <Icon spin icon={faSync} /> : ''} Save Settings</Button>{' '}
            </div>
        )
    }
}

export default SettingsPayment;