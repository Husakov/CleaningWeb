import React, { Component } from 'react';
import './SettingsGeneral.css';
import { Col, Button, Form, FormGroup, Label, Input, InputGroup, InputGroupAddon, FormFeedback, Collapse, Card, ListGroupItem, CardBody } from 'reactstrap';
import Toggle from '../../components/Toggle';
import Icon from '@fortawesome/react-fontawesome'
import {
    faSync, faChevronDown
} from "@fortawesome/fontawesome-free-solid/shakable.es";
import Select from '@kemoke/react-select';
import classSet from "react-classset";

class SettingsGeneral extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: 'settings general',
            general: {}
        }
    }
    handleChange = (value, type) => {
        let comp = { ...this.state.general };
        comp[type] = value;
        this.setState({ general: { ...comp } });
    }
    toggleChange = (value, type) => {

        this.handleChange(value, type);
    }
    render() {
        const { general } = this.state;
        return (
            <div className='Settings-General'>
                <Form>
                    <FormGroup row className='d-flex align-items-center'>
                        <Label for="sg-showLogo" sm={4}>Zip code restrictions:</Label>
                        <Col sm={6}>
                            <div className='d-flex align-items-center'>
                                <Toggle
                                    className=''
                                    value={general.zipRestrict ? general.zipRestrict : false}
                                    activeText={'Enabled'}
                                    inactiveText={'Disabled'}
                                    onClick={() => this.handleChange(general.zipRestrict === undefined ? true : !general.zipRestrict)}
                                />
                            </div>
                        </Col>
                    </FormGroup>
                    <FormGroup row className='d-flex align-items-center'>
                        <Label for="sg-zipRestrict" sm={4}>Zip code restrictions:</Label>
                        <Col sm={6}>
                            <Input type="textarea" name="sc-zipRestrict" id="sc-zipRestrict" placeholder="Postal codes"
                                onFocus={(e) => e.target.placeholder = ''}
                                onBlur={(e) => e.target.placeholder = 'Postal codes'}
                                value={general.zipRestrict ? general.zipRestrict : ''}
                                onChange={(e) => this.handleChange(e.currentTarget.value, 'zipRestrict')} />
                        </Col>
                    </FormGroup>
                    <FormGroup row className='d-flex align-items-center'>
                        <Label for="sg-timeInterval" sm={4}>Time Interval:</Label>
                        <Col sm={6}>
                            <Select
                                isSearchable={false}
                                value={general.schedulingTimeInterval}
                                onChange={(e) => this.handleChange(e ? e.value : e, 'schedulingTimeInterval')}
                                options={scheduleTimeIntervals}
                                placeholder={'Time Intervals...'}
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup row className='d-flex align-items-center'>
                        <Label for="sg-minBookingTime" sm={4}>Minimum advance booking time:</Label>
                        <Col sm={6}>
                            <Select
                                isSearchable={false}
                                value={general.minAdvBookingTime}
                                onChange={(e) => this.handleChange(e ? e.value : e, 'minAdvBookingTime')}
                                options={minBookingTime}
                                placeholder={'Minimum Time...'}
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup row className='d-flex align-items-center'>
                        <Label for="sg-maxBookingTime" sm={4}>Maximum advance booking time:</Label>
                        <Col sm={6}>
                            <Select
                                isSearchable={false}
                                value={general.maxAdvBookingTime}
                                onChange={(e) => this.handleChange(e ? e.value : e, 'maxAdvBookingTime')}
                                options={maxBookingTime}
                                placeholder={'Maximum Time...'}
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup row className='d-flex align-items-center'>
                        <Label for="sg-maxBookingTime" sm={4}>Late cancellation fee buffer time:</Label>
                        <Col sm={6}>
                            <Select
                                isSearchable={false}
                                value={general.lateCancelTime}
                                onChange={(e) => this.handleChange(e ? e.value : e, 'lateCancelTime')}
                                options={lateCancelTimes}
                                placeholder={'Cancel Time...'}
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup row className='d-flex align-items-center'>
                        <Label for="sg-maxBookingTime" sm={4}>Late reschedule fee buffer time:</Label>
                        <Col sm={6}>
                            <Select
                                isSearchable={false}
                                value={general.lateRescheduleTime}
                                onChange={(e) => this.handleChange(e ? e.value : e, 'lateRescheduleTime')}
                                options={lateRescheduleTimes}
                                placeholder={'Reschedule Time...'}
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup row className='d-flex align-items-center'>
                        <Label for="sg-maxBookingTime" sm={4}>Currency:</Label>
                        <Col sm={6}>
                            <Select
                                isSearchable={false}
                                value={general.currency}
                                onChange={(e) => this.handleChange(e ? e.value : e, 'currency')}
                                options={currencies}
                                placeholder={'Currency...'}
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup row className='d-flex align-items-center'>
                        <Label for="sg-maxBookingTime" sm={4}>Price Format:</Label>
                        <Col sm={6}>
                            <Select
                                isSearchable={false}
                                value={general.priceFormat}
                                onChange={(e) => this.handleChange(e ? e.value : e, 'priceFormat')}
                                options={priceFormats}
                                placeholder={'Format...'}
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup row className='d-flex align-items-center'>
                        <Label for="sg-maxBookingTime" sm={4}>Currency symbol position:</Label>
                        <Col sm={6}>
                            <Select
                                isSearchable={false}
                                value={general.symbolPosition}
                                onChange={(e) => this.handleChange(e ? e.value : e, 'symbolPosition')}
                                options={symbolPositions}
                                placeholder={'Symbol Position...'}
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup row style={{ marginBottom: 0 }}>
                        <Col sm={10}>
                            <ListGroupItem className='d-flex align-items-center justify-content-between' style={{ backgroundColor: '#F7F7F7' }}>
                                <span>Tax/Vat</span>
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
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Col sm={10}>
                            <Collapse className='pay-card' isOpen={this.state.stripeDrop}>
                                <Card>
                                    <CardBody>
                                        <FormGroup check>
                                            <Label check>
                                                <Input type="radio" name="radio1" />{' '}
                                                Percentage
                                            </Label>
                                        </FormGroup>
                                        <FormGroup check>
                                            <Label check>
                                                <Input type="radio" name="radio1" />{' '}
                                                Flat Fee
                                            </Label>
                                        </FormGroup>
                                        <FormGroup row>
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
                                    </CardBody>
                                </Card>
                            </Collapse>
                        </Col>
                    </FormGroup>
                    <br />
                    <FormGroup row style={{ marginTop: '1rem' }}>
                        <Label for="sc-save" sm={2}></Label>
                        <Col sm={6}>
                            <Button color="success"
                                disabled={this.props.pending}
                                onClick={() => this.props.editCompany(this.props.company.id, this.state.company)}
                            >{this.props.pending ? <Icon spin icon={faSync} /> : ''} Save changes</Button>{' '}
                            {/*<Button color="success"*/}
                            {/*onClick={() => console.table(this.state.company)}*/}
                            {/*>Save changes</Button>{' '}*/}
                        </Col>
                    </FormGroup>
                </Form>
            </div>
        )
    }
}
const scheduleTimeIntervals = [
    { value: '10 Minutes', label: '10 Minutes' },
    { value: '15 Minutes', label: '15 Minutes' },
    { value: '20 Minutes', label: '20 Minutes' },
    { value: '30 Minutes', label: '30 Minutes' },
    { value: '45 Minutes', label: '45 Minutes' },
    { value: '1 Hour', label: '1 Hour' },
    { value: '1.5 Hours', label: '1.5 Hour' },
    { value: '2 Hours', label: '2 Hours' },
    { value: '2.5 Hours', label: '2.5 Hours' },
    { value: '3 Hours', label: '3 Hours' },
];
const minBookingTime = [
    { value: '10 Minutes', label: '10 Minutes' },
    { value: '20 Minutes', label: '20 Minutes' },
    { value: '30 Minutes', label: '30 Minutes' },
    { value: '40 Minutes', label: '40 Minutes' },
    { value: '1 Hour', label: '1 Hour' },
    { value: '2 Hours', label: '2 Hours' },
    { value: '3 Hours', label: '3 Hours' },
    { value: '4 Hours', label: '4 Hours' },
    { value: '5 Hours', label: '5 Hours' },
    { value: '6 Hours', label: '6 Hours' },
    { value: '7 Hours', label: '7 Hours' },
    { value: '8 Hours', label: '8 Hours' },
    { value: '12 Hours', label: '12 Hours' },
    { value: '24 Hours', label: '24 Hours' },
    { value: '1 Day', label: '1 Day' },
    { value: '2 Days', label: '2 Days' },
    { value: '3 Days', label: '3 Days' },
    { value: '4 Days', label: '4 Days' },
    { value: '5 Days', label: '5 Days' },
    { value: '6 Days', label: '6 Days' },
    { value: '7 Days', label: '7 Days' },
];
const maxBookingTime = [
    { value: '1 Month', label: '1 Month' },
    { value: '2 Months', label: '2 Months' },
    { value: '3 Months', label: '3 Months' },
    { value: '4 Months', label: '4 Months' },
    { value: '5 Months', label: '5 Months' },
    { value: '6 Months', label: '6 Months' },
    { value: '1 Year', label: '1 Year' },
    { value: '2 Years', label: '2 Years' },
    { value: '3 Years', label: '3 Years' },
    { value: '4 Years', label: '4 Years' },
];
const lateCancelTimes = [
    { value: '1 Hour', label: '1 Hour' },
    { value: '2 Hours', label: '2 Hours' },
    { value: '3 Hours', label: '3 Hours' },
    { value: '4 Hours', label: '4 Hours' },
    { value: '5 Hours', label: '5 Hours' },
    { value: '6 Hours', label: '6 Hours' },
    { value: '7 Hours', label: '7 Hours' },
    { value: '8 Hours', label: '8 Hours' },
    { value: '9 Hours', label: '9 Hours' },
    { value: '10 Hours', label: '10 Hours' },
    { value: '11 Hours', label: '11 Hours' },
    { value: '12 Hours', label: '12 Hours' },
    { value: '24 Hours', label: '24 Hours' },
    { value: '48 Hours', label: '48 Hours' },
    { value: '72 Hours', label: '72 Hours' },
    { value: '96 Hours', label: '96 Hours' },
];
const lateRescheduleTimes = [
    { value: '1 Hour', label: '1 Hour' },
    { value: '2 Hours', label: '2 Hours' },
    { value: '3 Hours', label: '3 Hours' },
    { value: '4 Hours', label: '4 Hours' },
    { value: '5 Hours', label: '5 Hours' },
    { value: '6 Hours', label: '6 Hours' },
    { value: '7 Hours', label: '7 Hours' },
    { value: '8 Hours', label: '8 Hours' },
    { value: '9 Hours', label: '9 Hours' },
    { value: '10 Hours', label: '10 Hours' },
    { value: '11 Hours', label: '11 Hours' },
    { value: '12 Hours', label: '12 Hours' },
];
const currencies = [
    { value: '$USD', label: '$ United States Dollar' },
];
const priceFormats = [
    { value: '$USD', label: '0(e.g.$100)' },
    { value: '$USD', label: '1(e.g.$100.0)' },
    { value: '$USD', label: '2(e.g.$100.00)' },
    { value: '$USD', label: '3(e.g.$100.000)' },
    { value: '$USD', label: '4(e.g.$100.0000)' },
];
const symbolPositions = [
    { value: 'Before', label: 'Before(e.g.$100)' },
    { value: 'After', label: 'After(e.g.100$)' },

];
export default SettingsGeneral;