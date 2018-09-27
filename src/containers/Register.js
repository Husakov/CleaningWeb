import React, {Component} from 'react';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";

import {register} from '../reducers/registerReducer';
import {login} from '../reducers/loginReducer';

import {InputGroup, InputGroupAddon} from 'reactstrap';
import logo from './logo.png';
import "./Register.css"

class Register extends Component {
    constructor(props) {
        super(props);

        this.state = {
            step: 1,
            businessType: "Residential Cleaning",
            name: "",
            surname: "",
            email: "",
            password: "",
            company: "",
            url: "",
            phone: "",
            employeeName: "",
            employees: [],
            services: [{name: "House Cleaning", checked: false}, {
                name: "Carpet Cleaning",
                checked: false
            }, {name: "Office Cleaning", checked: false}],
            newServiceValue: "",
            addServices: false,
            error: {
                name: false,
                surname: false,
                email: false,
                password: false,
                company: false,
                newService: false,
                url: false,
                phone: false,
                employeeName: false
            },
            workingHours: [],
            workingDays: [
                {day: "Monday", working: true, start: "08:00 AM", end: "04:00 PM"},
                {day: "Tuesday", working: true, start: "08:00 AM", end: "04:00 PM"},
                {day: "Wednesday", working: true, start: "08:00 AM", end: "04:00 PM"},
                {day: "Thursday", working: true, start: "08:00 AM", end: "04:00 PM"},
                {day: "Friday", working: true, start: "08:00 AM", end: "04:00 PM"},
                {day: "Saturday", working: false, start: "08:00 AM", end: "04:00 PM"},
                {day: "Sunday", working: false, start: "08:00 AM", end: "04:00 PM"}],
            codes: [],
        }
    }

    componentWillMount() {
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
        this.setState({workingHours: sati})
    }

    componentWillReceiveProps(newProps) {
        if (newProps.requestSent) {
            this.props.login(this.state.email, this.state.password);
        }
        if (newProps.loggedIn)
            this.props.history.push('/dashboard/calendar');
        if (newProps.requestFailed)
            alert("An error occured");
    }

    addNewService(e) {
        e.preventDefault();
        e.stopPropagation();
        if (this.state.newServiceValue.length > 0) {
            let services = [...this.state.services];
            services.push({name: this.state.newServiceValue, checked: true});
            this.setState({services: services, newServiceValue: ""});
        }
    }

    addEmployee(e) {
        e.preventDefault();
        if (this.state.employeeName.length > 0) {
            let employees = [...this.state.employees];
            employees.push(this.state.employeeName);
            this.setState({employees: employees, employeeName: ""});
        }
        else {
            let error = {...this.state.error};
            error = {...error, employeeName: true};
            this.setState({error});
        }
    }

    submitSteps(e, step) {
        e.preventDefault();
        if (step === 1) {
            let fields = ["name", "surname", "email", "password", "company", "phone", "url"];
            let error = {...this.state.error};
            let isValid = true;
            for (let i = 0; i < fields.length; i++) {
                if (!(this.state[fields[i]].length > 0) && fields[i] !== "url") {
                    isValid = false;
                    let field = fields[i];
                    error = {...error, [field]: true};
                }
                if (fields[i] === "password" && this.state[fields[i]].length < 6) {
                    isValid = false;
                    let field = fields[i];
                    error = {...error, [field]: true};
                }
                if (fields[i] === "url" && this.state[fields[i]].length > 0) {

                    if (this.state.url.indexOf('.') === -1 || this.state.url.indexOf('.') === this.state.url.length - 1) {
                        isValid = false;
                        let field = fields[i];
                        error = {...error, [field]: true};
                    }
                    else if (this.state[fields[i]].substring(0, 7) !== 'http://' || this.state[fields[i]].substring(0, 7) !== 'http://') {
                        let url = "http://" + this.state.url;
                        this.setState({url});
                    }
                }
                if (fields[i] === "phone") {
                    let phone = this.state.phone.split("");
                    for (let j = 0; j < phone.length; j++) {
                        if (phone[j] === " " || phone[j] === "-")
                            phone[j] = "";
                        if (phone[j] === "+") {
                            isValid = false;
                            let field = fields[i];
                            error = {...error, [field]: true};
                        }

                    }

                    phone = phone.join("");
                    if (!Number.isInteger(Number(phone))) {
                        isValid = false;
                        let field = fields[i];
                        error = {...error, [field]: true};
                    }
                    else this.setState({phone})
                }
            }
            if (!isValid) {
                this.setState({error});
                return false;
            }
            else {
                this.setState({step: this.state.step + 1});
                return false;
            }
        }
        if (step === 2) {
            this.setState({step: this.state.step + 1});
            return false;
        }
        if (step === 3) {
            this.setState({step: this.state.step + 1});
            return false;
        }
    }

    handleSubmitSteps(e) {
        e.preventDefault();
        let days = [];
        for (let i = 0; i < this.state.workingDays.length; i++) {
            let hours = "";
            if (this.state.workingDays[i].working)
                hours += this.state.workingDays[i].start + "-" + this.state.workingDays[i].end;
            else
                hours = "no";
            days.push(hours);
        }
        let services = [];
        for (let i = 0; i < this.state.services.length; i++) {
            if (this.state.services[i].checked)
                services.push(this.state.services[i].name);
        }
        let body = {
            name: this.state.name,
            surname: this.state.surname,
            email: this.state.email,
            password: this.state.password,
            phone_number: "+1" + this.state.phone,
            company: this.state.company,
            business_type: this.state.businessType,
            workers: this.state.employees,
            services: services,
            timetable: days
        };
        if (this.state.url.length > 0)
            body = {...body, website: this.state.url};
        this.props.register(body);
        return false;
    }

    skip(step) {
        if (step === 3)
            this.setState({employees: [], step: 3});
        if (step === 4)
            this.setState({
                services: [{name: "House Cleaning", checked: false}, {
                    name: "Carpet Cleaning",
                    checked: false
                }, {name: "Office Cleaning", checked: false}],
                step: 4
            })
    }

    render() {
        let step;
        switch (this.state.step) {
            case 1:
                step = (
                    <form onSubmit={(e) => {
                        this.submitSteps(e, 1)
                    }}>
                        <div className="form-group row">
                            <div className="col-md-6">
                                <label>First Name*</label>
                                <input type="text"
                                       className="form-control"
                                       required={this.state.error.name}
                                       placeholder="First Name"
                                       value={this.state.name}
                                       onChange={(e) => this.setState({
                                           name: e.target.value,
                                           error: {...this.state.error, name: false}
                                       })}/>
                                {this.state.error.name &&
                                <div className="invalid-feedback"> Please enter your name </div>}
                            </div>
                            <div className="col-md-6">
                                <label>Last Name*</label>
                                <input type="text"
                                       className="form-control"
                                       required={this.state.error.surname}
                                       placeholder="Last Name"
                                       value={this.state.surname}
                                       onChange={(e) => this.setState({
                                           surname: e.target.value,
                                           error: {...this.state.error, surname: false}
                                       })}/>
                                {this.state.error.surname &&
                                <div className="invalid-feedback"> Please enter your surname </div>}
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Email*</label>
                            <input type="email"
                                   className="form-control"
                                   required={this.state.error.email}
                                   placeholder="Email"
                                   value={this.state.email}
                                   onChange={(e) => this.setState({
                                       email: e.target.value,
                                       error: {...this.state.error, email: false}
                                   })}/>
                            {this.state.error.email &&
                            <div className="invalid-feedback"> Please enter a valid email address. </div>}
                        </div>
                        <div className="form-group">
                            <label>Password*</label>
                            <input type="password"
                                   className="form-control"
                                   required={this.state.error.password}
                                   placeholder="Password"
                                   value={this.state.password}
                                   onChange={(e) => this.setState({
                                       password: e.target.value,
                                       error: {...this.state.error, password: false}
                                   })}/>
                            {this.state.error.password &&
                            <div className="invalid-feedback"> Password should be at least 6 characters</div>}
                        </div>
                        <div className="form-group">
                            <label>Company*</label>
                            <input type="text"
                                   className="form-control"
                                   required={this.state.error.company}
                                   placeholder="Company"
                                   value={this.state.company}
                                   onChange={(e) => this.setState({
                                       company: e.target.value,
                                       error: {...this.state.error, company: false}
                                   })}/>
                            {this.state.error.company &&
                            <div className="invalid-feedback"> Please enter your companies name </div>}
                        </div>
                        <div className="form-group">
                            <label>Company's URL</label>
                            <input type="text"
                                   className="form-control"
                                   placeholder="Company's URL"
                                   value={this.state.url}
                                   onChange={(e) => this.setState({
                                       url: e.target.value,
                                       error: {...this.state.error, url: false}
                                   })}/>
                            {this.state.error.url && <div className="invalid-feedback"> Please enter a valid url</div>}

                        </div>
                        <div className="form-group">
                            <label>Business Type</label>
                            <select className="form-control custom-select"
                                    value={this.state.businessType}
                                    onChange={(e) => this.setState({businessType: e.target.value})}>
                                <option value="Residential Cleaning">Residential Cleaning</option>
                                <option value="Janitorial">Janitorial</option>
                                <option value="Carpet Cleaning">Carpet Cleaning</option>
                                <option value="Landscaping">Landscaping</option>
                                <option value="HVAC">HVAC</option>
                                <option value="Plumbing">Plumbing</option>
                                <option value="Window Cleaning">Window Cleaning</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Phone Number*</label>
                            <InputGroup>
                                <InputGroupAddon addonType="prepend">+1</InputGroupAddon>
                                <input type="text"
                                       className="form-control"
                                       placeholder="Phone Number"
                                       required={this.state.error.phone}
                                       value={this.state.phone}
                                       onChange={(e) => this.setState({
                                           phone: e.target.value,
                                           error: {...this.state.error, phone: false}
                                       })}/>
                                {this.state.error.phone &&
                                <div className="invalid-feedback"> Please enter your phone number </div>}
                            </InputGroup>
                        </div>
                        <div className="form-group">
                            <button className="btn btn-primary steps-button" type="submit"
                                    style={{float: 'right'}}>Next
                            </button>
                        </div>
                    </form>
                );
                break;
            case 2:
                step = (
                    <div>
                        <div className="card-header register-header">
                            Add Employee(s)
                        </div>
                        <form onSubmit={(e) => this.addEmployee(e)}>
                            <div className="form-group">
                                <label>Employee's Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Full Name"
                                    required={this.state.error.employeeName}
                                    value={this.state.employeeName}
                                    onChange={(e) => this.setState({employeeName: e.target.value})}/>
                            </div>
                            <div className="form-group">
                                <button className="btn btn-success add-employee-btn" type="submit">Add Employee</button>
                            </div>

                            <div className="employees">
                                {this.state.employees.map((employee) => {
                                    return (
                                        <div className="card employee" key={employee}>
                                            <div className="card-header"><img
                                                className="add-employee-img"
                                                src="https://react.semantic-ui.com/assets/images/avatar/large/jenny.jpg"
                                                alt="employee-logo"/>
                                                <label style={{paddingTop: '15px'}}>{employee}</label></div>
                                        </div>
                                    )
                                })}
                            </div>
                            <div style={{marginBottom: '20px'}}><a href="javascript:void(0)" onClick={() => {
                                this.skip(3)
                            }} style={{left: 0}}>Skip</a></div>
                            <button className="btn btn-primary steps-button" style={{float: 'left'}} onClick={(e) => {
                                e.preventDefault();
                                this.setState({step: this.state.step - 1})
                            }}>Back
                            </button>
                            <button className="btn btn-primary steps-button" style={{float: 'right'}}
                                    onClick={(e) => this.submitSteps(e, 2)} type="submit">Next
                            </button>
                        </form>
                    </div>
                );
                break;
            case 3:
                step = (
                    <div>
                        <div className="card-header register-header">
                            Add Services
                        </div>
                        <div className="services-wrapper">
                            <form className="services">
                                {this.state.services.map((service, i) => {
                                    return (
                                        <div className="checkbox service" key={i}>
                                            <div style={{fontSize: '1em'}}>
                                                <input className="checkbox" checked={service.checked}
                                                       onChange={() => {
                                                           let current = [...this.state.services];
                                                           current[i] = {
                                                               name: service.name,
                                                               checked: !current[i].checked
                                                           };
                                                           this.setState({services: current, isServiceSelected: true})
                                                       }}
                                                       type="checkbox" value=" "/>
                                                <span style={{paddingLeft: '5px'}}>{service.name}</span>
                                            </div>
                                        </div>)
                                })}
                            </form>
                            {this.state.addServices &&
                            <form onSubmit={(e) => this.addNewService(e)} className="form-group add-service">
                                <input className="form-control add-service-input"
                                       placeholder="Service Name"
                                       type="text"
                                       value={this.state.newServiceValue}
                                       required={this.state.error.newService}
                                       onChange={(e) => this.setState({newServiceValue: e.target.value})}/>
                                <button type="submit" className="btn btn-success add-service-button">
                                    <span>Add Service</span></button>
                            </form>}
                            <a href="javascript:void(0)" className="add-more" onClick={() => {
                                this.setState({addServices: true})
                            }} style={{float: 'left'}}>Add More</a>
                            <div style={{marginTop: '50px'}}>
                                <div style={{marginBottom: '20px'}}><a href="javascript:void(0)"
                                                                       onClick={() => this.skip(4)}
                                                                       style={{left: 0}}>Skip</a></div>
                                <button className="btn btn-primary steps-button" style={{float: 'left'}}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            this.setState({step: this.state.step - 1})
                                        }}>Back
                                </button>
                                <button className="btn btn-primary steps-button" style={{float: 'right'}}
                                        onClick={(e) => this.submitSteps(e, 3)}>Next
                                </button>
                            </div>
                        </div>
                    </div>
                );
                break;
            case 4:
                step = (
                    <div className='container-fluid p-0'>
                        <h4 style={{textAlign: "center"}}>Business Hours</h4>
                        {this.state.workingDays.map((day, index) => {
                            return (
                                <div className="hours" key={day.day}>
                                    <label>
                                        <input className="checkbox" checked={day.working}
                                               style={{verticalAlign: "middle"}}
                                               onChange={() => {
                                                   let days = [...this.state.workingDays];
                                                   days[index] = {
                                                       day: days[index].day,
                                                       start: days[index].start,
                                                       end: days[index].end,
                                                       working: !days[index].working
                                                   };
                                                   this.setState({workingDays: days})
                                               }}
                                               type="checkbox" value=" "/>
                                        <span style={{paddingLeft: '5px'}}
                                              className="hours-dropdown-label">{day.day}</span></label>
                                    <select className="form-control hours-dropdown custom-select" value={day.start}
                                            onChange={(e) => {
                                                let days = [...this.state.workingDays];
                                                days[index] = {
                                                    day: days[index].day,
                                                    start: e.target.value,
                                                    end: days[index].end,
                                                    working: days[index].working
                                                };
                                                this.setState({workingDays: days})
                                            }}>
                                        {this.state.workingHours.map((hours, i) => {
                                            return (
                                                <option value={hours} key={i}>{hours}</option>
                                            )
                                        })}
                                    </select>
                                    <select className="form-control hours-dropdown custom-select" value={day.end}
                                            onChange={(e) => {
                                                let days = [...this.state.workingDays];
                                                days[index] = {
                                                    day: days[index].day,
                                                    start: days[index].start,
                                                    end: e.target.value,
                                                    working: days[index].working
                                                };
                                                this.setState({workingDays: days})
                                            }}>
                                        {this.state.workingHours.map((hours, i) => {
                                            return (
                                                <option value={hours} key={i}>{hours}</option>
                                            )
                                        })}
                                    </select>
                                </div>)
                        })}
                        <button className="btn btn-primary steps-button" style={{float: 'left'}} onClick={(e) => {
                            e.preventDefault();
                            this.setState({step: this.state.step - 1})
                        }}>Back
                        </button>
                        <button className="btn btn-success" style={{float: 'right'}}
                                disabled={this.props.sendingRequest} onClick={(e) => this.handleSubmitSteps(e)}>Finish
                        </button>

                    </div>
                );
                break;
            default:
                break;
        }
        return (
            <div className="Register container-fluid">
                <div className="row background">
                    <div className="register-container col-lg-6 offset-lg-3 col-md-10 offset-md-1">
                        <div className="card">
                            <div className="card-header">
                                <img src={logo} alt="service-roller logo"/>
                                <h2>Register</h2>
                            </div>
                            <div className="card-body">
                                {step}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        requestSent: state.register.requestSent,
        sendingRequest: state.register.sendingRequest,
        requestFailed: state.register.requestFailed,
        loggedIn: state.login.requestSent
    };
};
const mapDispatchToProps = dispatch => {
    return bindActionCreators(
        {
            register: register,
            login: login
        },
        dispatch
    );
};
export default connect(mapStateToProps, mapDispatchToProps)(Register);
