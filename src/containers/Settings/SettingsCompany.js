import React, { Component } from 'react';
import './SettingsCompany.css';
import { Row, Col, Button, Form, FormGroup, Label, Input, FormFeedback, InputGroup, InputGroupAddon } from 'reactstrap';
import ImageInput from "../../components/ImageInput/ImageInput";
import { getError } from "../../util";
import SettingsCompanyModel from '../../model/settingsCompany';
import Icon from '@fortawesome/react-fontawesome'
import {
    faSync
} from "@fortawesome/fontawesome-free-solid/shakable.es";
import Toggle from '../../components/Toggle';
import Select from '@kemoke/react-select';
import timezone from './timezone';


class SettingsCompany extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: 'settings company',
            preview: '',
            days: ["Sunday", 'Monday', "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            isActive: [false, false, false, false, false, false, false],
            workingHours: [],
            hours: [],
            company: new SettingsCompanyModel(this.props.company),
            selectedTimeZone: null,
            showLogo: false,
        }
    }

    componentWillMount() {
        let active = [...this.state.isActive];
        active = this.props.timetable.map((day) => {
            return day === 'no' ? false : true;
        });
        this.setState({ workingHours: this.props.timetable, isActive: active });
        let sati = [];
        let minutes = "00";
        let hours = 12;
        for (let j = 0; j < 4; j++) {
            sati.push(
                hours + ":" + minutes + " AM"
            );
            minutes = Number(minutes) + 15;
        }
        for (let i = 1; i < 12; i++) {
            minutes = "00",
                hours = i;
            if (hours < 10) hours = "0" + hours;
            for (let j = 0; j < 4; j++) {
                sati.push(
                    hours + ":" + minutes + " AM"
                );
                minutes = Number(minutes) + 15;
            }
        }
        minutes = "00";
        hours = 12;
        for (let j = 0; j < 4; j++) {
            sati.push(
                hours + ":" + minutes + " PM"
            );
            minutes = Number(minutes) + 15;
        }
        for (let i = 1; i < 13; i++) {
            let minutes = "00",
                hours = i;
            if (hours < 10) hours = "0" + hours;
            for (let j = 0; j < 4; j++) {
                sati.push(
                    hours + ":" + minutes + " PM"
                );
                minutes = Number(minutes) + 15;
            }
        }
        this.setState({ hours: sati });
    }

    changeDate(e, i, j) {
        let date = this.state.workingHours[i];
        if (e.target) {
            date = date.split("-");
            date[j] = e.target.value;
            date = date.join("-");
        }
        else
            date = e;
        let dates = [...this.state.workingHours];
        dates[i] = date;
        this.setState({ workingHours: dates, company: { ...this.state.company, timetable: dates } });
    }

    handleImage = (e) => {
        // this.props.handleImage(e);
        let reader = new FileReader();
        const image = e.target.files[0];

        reader.readAsDataURL(image);

        reader.onloadend = () => {
            this.setState({
                preview: reader.result,
                company: { ...this.state.company, logo: image }
            });
        }
    };

    error(name) {
        if (!this.props.error) return undefined;
        return getError(this.props.error.errors, name);
    }

    handleChange = (e, type) => {
        let comp = { ...this.state.company };
        comp[type] = e.currentTarget.value;
        this.setState({ company: { ...comp } });
    }
    handleTimeZoneChange = (selectedTimeZone) => {
        this.setState({ selectedTimeZone });
    }
    toggleChange = (value, type) => {
        let e = {
            currentTarget: {
                value
            }
        };
        this.handleChange(e, type);
    }
    render() {
        const { company, preview, selectedTimeZone } = this.state;
        return (
            <div className='Settings-Company'>
                <Form>
                    <FormGroup row>
                        <Label for="sc-timezone" sm={2}>Time Zone:</Label>
                        <Col sm={6}>
                            <Select
                                value={selectedTimeZone}
                                onChange={this.handleTimeZoneChange}
                                options={timezone}
                                placeholder={'Select time zone...'}
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="sc-name" sm={2}>Name:</Label>
                        <Col sm={6}>
                            <Input type="text" name="sc-name" id="sc-name" placeholder="Company name"
                                onFocus={(e) => e.target.placeholder = ''}
                                onBlur={(e) => e.target.placeholder = 'Company name'}
                                value={company.name ? company.name : ''}
                                onChange={(e) => this.handleChange(e, 'name')} />
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="sc-website" sm={2}>Website:</Label>
                        <Col sm={6}>
                            <Input type="url" name="sc-website" id="sc-website" placeholder="Company website"
                                onFocus={(e) => e.target.placeholder = ''}
                                onBlur={(e) => e.target.placeholder = 'Company website'}
                                value={company.website ? company.website : ''} onChange={(e) => this.handleChange(e, 'website')} />
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="sc-email" sm={2}>Email:</Label>
                        <Col sm={6}>
                            <Input type="email" name="sc-email" id="sc-email" placeholder="company email"
                                onFocus={(e) => e.target.placeholder = ''}
                                onBlur={(e) => e.target.placeholder = 'company email'}
                                value={company.email ? company.email : ''} onChange={(e) => this.handleChange(e, 'email')} />
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="sc-code" sm={2}>Country Code:</Label>
                        <Col sm={6}>
                            <Input type="text" name="sc-code" id="sc-code" placeholder="+1"
                                onFocus={(e) => e.target.placeholder = ''}
                                onBlur={(e) => e.target.placeholder = '+1'}
                                value={company.code ? company.code : ''} onChange={(e) => this.handleChange(e, 'code')} />
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="sc-number" sm={2}>Phone number:</Label>
                        <Col sm={6}>
                            <InputGroup>
                                <InputGroupAddon addonType="prepend">+1</InputGroupAddon>
                                <Input type="number" name="sc-number" id="sc-number" placeholder="Company phone number"
                                    onFocus={(e) => e.target.placeholder = ''}
                                    onBlur={(e) => e.target.placeholder = 'Company number'}
                                    value={company.phone_number ? company.phone_number : ''} onChange={(e) => this.handleChange(e, 'phone_number')} />
                            </InputGroup>
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="sc-address" sm={2}>Address:</Label>
                        <Col sm={6}>
                            <Input type="text" name="sc-address" id="sc-address" placeholder="Company address"
                                onFocus={(e) => e.target.placeholder = ''}
                                onBlur={(e) => e.target.placeholder = 'Company address'}
                                value={company.address ? company.address : ''} onChange={(e) => this.handleChange(e, 'address')} />
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="sc-city" sm={2}>City:</Label>
                        <Col sm={6}>
                            <Input type="text" name="sc-city" id="sc-city" placeholder="Company city"
                                onFocus={(e) => e.target.placeholder = ''}
                                onBlur={(e) => e.target.placeholder = 'Company city'}
                                value={company.city ? company.city : ''} onChange={(e) => this.handleChange(e, 'city')} />
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="sc-country" sm={2}>Country:</Label>
                        <Col sm={6}>
                            <Input type="text" name="sc-country" id="sc-country" placeholder="Company country"
                                onFocus={(e) => e.target.placeholder = ''}
                                onBlur={(e) => e.target.placeholder = 'Company country'}
                                value={company.country ? company.country : ''} onChange={(e) => this.handleChange(e, 'country')} />
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="sc-state" sm={2}>State:</Label>
                        <Col sm={6}>
                            <Input type="text" name="sc-state" id="sc-state" placeholder="Company state"
                                onFocus={(e) => e.target.placeholder = ''}
                                onBlur={(e) => e.target.placeholder = 'Company state'}
                                value={company.state ? company.state : ''} onChange={(e) => this.handleChange(e, 'state')} />
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="sc-zip" sm={2}>Zip:</Label>
                        <Col sm={6}>
                            <Input type="text" name="sc-zip" id="sc-zip" placeholder="Company zip"
                                onFocus={(e) => e.target.placeholder = ''}
                                onBlur={(e) => e.target.placeholder = 'Company zip'}
                                value={company.zip ? company.zip : ''} onChange={(e) => this.handleChange(e, 'zip')} />
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="sc-logo" sm={2}>Company Logo:</Label>
                        <Col>
                            <ImageInput type="file"
                                value={preview !== '' ? preview : this.props.company.logo_url}
                                onChange={this.handleImage}
                                // disabled={this.props.disabled}
                                accept="image/*"
                                invalid={this.error("image")}
                                name="image" />
                            <FormFeedback>{this.error("image")}</FormFeedback>
                        </Col>
                    </FormGroup>
                    <FormGroup row className='d-flex align-items-center'>
                        <Label for="sc-showLogo" sm={2}>Show Logo:</Label>
                        <Col sm={8}>
                            <div className='d-flex align-items-center'>
                                <Toggle
                                    className=''
                                    value={company.showLogo ? company.showLogo : false}
                                    activeText={'Enabled'}
                                    inactiveText={'Disabled'}
                                    onClick={(e) => this.toggleChange(company.showLogo === undefined ? true : !company.showLogo, 'showLogo')}
                                />
                            </div>
                        </Col>
                    </FormGroup>
                    <FormGroup row className='d-flex align-items-center'>
                        <Label for="sc-adressHeader" sm={2}>Show company address in header:</Label>
                        <Col sm={8}>
                            <div className='d-flex align-items-center'>
                                <Toggle
                                    className=''
                                    value={company.showAddress ? company.showAddress : false}
                                    activeText={'Enabled'}
                                    inactiveText={'Disabled'}
                                    onClick={(e) => this.toggleChange(company.showAddress === undefined ? true : !company.showAddress, 'showAddress')}
                                />
                            </div>
                        </Col>
                    </FormGroup>
                    {this.state.workingHours.map((day, i) => {
                        return (
                            <Row key={i} className="team-availability">
                                <Col md={2}>
                                    <Label style={{ paddingLeft: "20px" }}>
                                        <Input type="checkbox"
                                            checked={this.state.isActive[i]}
                                            value=" "
                                            onChange={() => {
                                                let isActive = [...this.state.isActive];
                                                isActive[i] = !isActive[i];
                                                this.setState({ isActive })
                                            }}
                                        />{' '}
                                        {this.state.days[i]}
                                    </Label>
                                </Col>
                                <Col md={3} xs={12}>
                                    <Input type="select" value={day.split("-")[0]}
                                        onChange={(e) => {
                                            this.changeDate(e, i, 0)
                                        }}
                                    >
                                        {this.state.hours.map((time, i) => {
                                            return (
                                                <option key={time + i}>{time}</option>
                                            )
                                        })}
                                    </Input>
                                </Col>
                                <Col md={3} xs={12}>
                                    <Input type="select" value={day.split("-")[1]}
                                        onChange={(e) => {
                                            this.changeDate(e, i, 1)
                                        }}
                                    >
                                        {this.state.hours.map((time, i) => {
                                            return (
                                                <option key={time + i}>{time}</option>
                                            )
                                        })}
                                    </Input>
                                </Col>
                            </Row>
                        )
                    })}
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

export default SettingsCompany;