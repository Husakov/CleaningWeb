import React, {Component} from 'react';
import {Button, Col, Form, FormFeedback, FormGroup, Input, Label, Row} from 'reactstrap';
import {faSync} from '@fortawesome/fontawesome-free-solid/shakable.es';
import Icon from '@fortawesome/react-fontawesome'
import Toggle from '../Toggle'
import './Staff.css';
import {getError} from "../../util";
import {ColorPicker} from "../ColorPicker";

class TeamDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pickerActive: false,
            workingHours: [],
            days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            isActive: [false, false, false, false, false, false, false],
            team: props.team
        }
    }

    componentWillMount() {
        let isActive = [];
        let team = {...this.props.team};

        for (let i = 0; i < this.props.team.timetable.length; i++) {
            isActive[i] = true;
            let timetable = [...team.timetable];
            if (team.timetable[i] === "no") {
                isActive[i] = false;
                for (let j = i; j > 0; j--) {
                    if (timetable[j] !== "no") {
                        timetable[i] = timetable[j];
                        break;
                    }
                }
                if (timetable[i] === "no") {
                    for (let j = 0; j > timetable.length; j++) {
                        if (timetable[j] !== "no") {
                            timetable[i] = timetable[j];
                            break;
                        }
                    }
                }
                team = {...team, timetable: timetable}
            }
        }
        this.setState({isActive: isActive, team})
    }

    componentWillReceiveProps(newProps) {
        if (this.props.state.fulfilled !== newProps.state.fulfilled && newProps.state.fulfilled)
            this.props.toggle();
    }

    handleFormInput(field, data) {
        const staff = this.state.team;
        this.setState({team: {...this.state.team, [field]: data}})
    }

    changeDate(e, i, j) {
        let date = this.state.team.timetable[i];
        if (e.target) {
            date = date.split("-");
            date[j] = e.target.value;
            date = date.join("-");
        }
        else
            date = e;
        let dates = [...this.state.team.timetable];
        dates[i] = date;
        this.setState({team: {...this.state.team, timetable: dates}});
    }

    editTeam() {
        let body = {name: undefined, color: undefined, available: undefined, timetable: undefined};
        if (this.state.team.name !== this.props.team.name)
            body.name = this.state.team.name;

        if (this.state.team.color !== this.props.team.color)
            body.color = this.state.team.color;
        if (this.state.team.available !== this.props.team.available)
            body.available = this.state.team.available;
        let timetable = [...this.state.team.timetable];
        for (let i = 0; i < this.state.isActive.length; i++) {
            if (!this.state.isActive[i])
                timetable[i] = "no";
        }
        body.timetable = timetable;
        this.props.editTeam(this.state.team.id, body);
    }

    createTeam() {
        let timetable = [...this.state.team.timetable];
        for (let i = 0; i < this.state.isActive.length; i++) {
            if (!this.state.isActive[i])
                timetable[i] = "no";
        }
        this.setState({team: {...this.state.team, timetable: timetable}}, () => {
            this.props.create(this.state.team.name, this.state.team.color, timetable, this.state.team.available);
        })
    }

    save(e) {
        e.preventDefault(e);
        if (this.state.team.id)
            this.editTeam();
        else
            this.createTeam();
    }

    error(name) {
        if (!this.props.errors) return undefined;
        return getError(this.props.errors, name);
    }

    render() {
        return (

            <Form onSubmit={(e) => this.save(e)}>
                <FormGroup>

                    <Label>Team Name</Label>
                    <Input value={this.state.team.name}
                           onChange={e => this.handleFormInput("name", e.target.value)}
                           placeholder="Team Name"
                           maxLength="16"
                           invalid={!this.state.team.name.length > 0 && this.error("name")}
                    />
                    <FormFeedback>{!this.state.team.name.length > 0 && this.error("name")}</FormFeedback>
                </FormGroup>
                <FormGroup>
                    <Label>Color</Label>
                    <div style={{position: 'relative'}}>
                        <Input type="text"
                               className="service-color-input"
                               name="colorTag" id="colorTag"
                               value={this.state.team.color}
                               onChange={(e) => this.setState({color: e.target.value})}
                               readOnly
                               onFocus={() => this.setState({pickerActive: true})}
                               onBlur={() => this.setState({pickerActive: false})}/>
                        <div className="team-color-input-box" style={{background: this.state.team.color}}/>
                        <ColorPicker show={this.state.pickerActive}
                                     color={this.state.team.color}
                                     onChange={color => this.handleFormInput('color', color.hex)}/>
                    </div>
                </FormGroup>

                <h4 className="team-availability-header">Team Working Hours</h4>
                {this.state.team.timetable.map((day, i) => {
                    return (
                        <Row key={i} className="team-availability">
                            <Col md={4}>
                                <Label style={{paddingLeft: "20px"}}>
                                    <Input type="checkbox"
                                           checked={this.state.isActive[i]}
                                           value=" "
                                           onChange={() => {
                                               let isActive = [...this.state.isActive];
                                               isActive[i] = !isActive[i];
                                               this.setState({isActive})
                                           }}
                                    />{' '}
                                    {this.state.days[i]}
                                </Label>
                            </Col>
                            <Col md={4} xs={6}>
                                <Input type="select" value={day.split("-")[0]}
                                       onChange={(e) => {
                                           this.changeDate(e, i, 0)
                                       }}
                                >
                                    {this.props.hours.map((time, i) => {
                                        return (
                                            <option key={time + i}>{time}</option>
                                        )
                                    })}
                                </Input>
                            </Col>
                            <Col md={4} xs={6}>
                                <Input type="select" value={day.split("-")[1]}
                                       onChange={(e) => {
                                           this.changeDate(e, i, 1)
                                       }}
                                >
                                    {this.props.hours.map((time, i) => {
                                        return (
                                            <option key={time + i}>{time}</option>
                                        )
                                    })}
                                </Input>
                            </Col>
                        </Row>
                    )
                })}
                <Row style={{marginTop: '10px'}}>
                    <Col md={4}>
                        <Label>Status</Label>
                    </Col>
                    <Col md={8}>
                        <Toggle activeText="Active"
                                inactiveText="Inactive"
                                onClick={() => {
                                    this.handleFormInput("available", !this.state.team.available);
                                }}
                                value={this.state.team.available}/>
                    </Col>
                </Row>
                <Row>
                    <Col md={{size: 4, offset: 4}}>
                        < Button color="success"
                                 className="submit-team-button"
                                 disabled={this.props.state.pending}

                        >
                            {this.props.state.pending ? <Icon spin icon={faSync}/> : null}
                            {this.props.team.id ? "Save Changes" : "Create"}</Button>
                    </Col>
                </Row>
            </Form>

        );
    }
}

export default TeamDetails;
