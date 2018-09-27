import React from 'react';
import {Col, FormFeedback, Input, Label, Row} from "reactstrap";
import DatePicker from 'react-datepicker';
import {getError} from "../../util";
import moment from 'moment';
import Repeat from '../staff/Repeat';


class BlockOffInfoForm extends React.Component {
    error(name) {
        if (!this.props.errors) return undefined;
        return getError(this.props.errors, name);
    };

    render() {
        const {
            blockoff, handleFormInput, toggleRepeat, repeat, toggleRepeatNumber, toggleRepeatType,
            toggleRepeatOn, toggleRadioDays, handleChangeEndTime
        } = this.props;
        return (
            <Row>
                <Col md={12} className="mb-2 d-flex p-0">
                    <Col md={4} className="d-flex align-items-center">
                        <Label for="customer">
                            Duration:
                        </Label>
                    </Col>
                    <Col md={8} className="d-flex justify-content-between">
                        <div className="w-100">
                            <Label for="customer">
                                Start Time:
                            </Label>
                            <DatePicker
                                selected={moment(this.props.blockoff.start_time)}
                                showTimeSelect
                                onChange={(e) => this.props.changeStartTime(e)}
                                onSelect={(e) => this.props.changeStartTime(e)}
                                timeFormat="HH:mm A"
                                timeIntervals={15}
                                className="form-control"
                                dateFormat="MM/DD/YYYY hh:mm A"
                                timeCaption="time"
                                /*disabled should be a bool thats why im checking*/
                                disabled={this.props.blockoff.repeat?true:false}
                            />
                            <FormFeedback/>
                        </div>
                        <div style={{marginLeft: "10px"}} className="w-100">
                            <Label for="customer">
                                End Time:
                            </Label>
                            <DatePicker
                                selected={moment(this.props.blockoff.end_time)}
                                onChange={(e) => this.props.changeEndTime(e)}
                                onSelect={(e) => this.props.changeEndTime(e)}
                                showTimeSelect
                                timeFormat="HH:mm A"
                                timeIntervals={15}
                                className="form-control"
                                dateFormat="MM/DD/YYYY hh:mm A"
                                timeCaption="time"
                                disabled={this.props.blockoff.repeat?true:false}
                            />
                            <FormFeedback/>
                        </div>
                    </Col>
                </Col>
                {blockoff.id === -1 && <Col className="d-flex input-row mb-2 p-0" md={12}>
                    <Col md={4} className="d-flex align-items-center">
                        <Label for="customer">
                            Repeat
                        </Label>
                    </Col>
                    <Col md={8} className="pl-0">
                        <Repeat
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
                            radioDays={repeat.radioDays ? repeat.radioDays : {}} />
                    </Col>
                </Col>}
                <Col md={12} className="d-flex input-row mb-2 p-0">
                    <Col md={4}>
                        <Label>
                            Staff <span className="text-danger">*</span>
                        </Label>
                    </Col>
                    <Col md={8}>
                        <Input type="select"
                               onChange={(e) => handleFormInput("team_id", e.target.value)}
                               value={blockoff.team_id ? blockoff.team_id : -1}
                               className="w-100">
                            <optgroup label="Teams">
                                {this.props.staff.map((team) => {
                                    return (
                                        team.id !== 0 && <option value={team.id} key={team.id}>{team.name}</option>
                                    )
                                })}
                            </optgroup>
                            <optgroup label="Staff">
                                {this.props.staff[this.props.staff.length - 1].users.map(user => {
                                    return (
                                        <option key={user.id}>{user.name}</option>
                                    )
                                })}
                            </optgroup>
                        </Input>
                        <FormFeedback>{this.error("staff")}</FormFeedback>
                    </Col>
                </Col>
                <Col md={12} className="d-flex align-items-center p-0 mb-2">
                    <Col md={4}>
                        <Label>
                            Color:
                        </Label>
                    </Col>
                    <Col md={8} className="d-flex justify-content-between">
                        <div onClick={() => handleFormInput("color", "#323232")}
                             className={blockoff.color === "#323232" ? "block-off-color active" : "block-off-color"}
                             style={{backgroundColor: "#323232"}}/>
                        <div onClick={() => handleFormInput("color", "#4c4c4c")}
                             className={blockoff.color === "#4c4c4c" ? "block-off-color active" : "block-off-color"}
                             style={{backgroundColor: "#4c4c4c"}}/>
                        <div onClick={() => handleFormInput("color", "#000066")}
                             className={blockoff.color === "#000066" ? "block-off-color active" : "block-off-color"}
                             style={{backgroundColor: "#000066"}}/>
                        <div onClick={() => handleFormInput("color", "#00004c")}
                             className={blockoff.color === "#00004c" ? "block-off-color active" : "block-off-color"}
                             style={{backgroundColor: "#00004c"}}/>
                    </Col>
                </Col>
                <Col md={12} className="d-flex p-0 mb-2">
                    <Col md={4}>
                        <Label>
                            Note:
                        </Label>
                    </Col>
                    <Col md={8}>
                        <Input type="textarea"
                               value={blockoff.note}
                               maxLength="190"
                               name="note"
                               onChange={(e) => handleFormInput("note", e.target.value)}/>
                        <span>{blockoff.note ? blockoff.note.length : 0}/190</span>
                    </Col>
                </Col>
            </Row>
        )
    }
}

export default BlockOffInfoForm;
