import React, {Component, Fragment} from 'react';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {createBlockoff, editBlockoff} from '../../reducers/calendarReducer';
import {getStaff} from '../../reducers/staffReducer';
import BlockOffModel from '../../model/blockoff';
import BlockOffInfoForm from '../../components/Calendar/BlockOffInfoForm';
import Icon from '@fortawesome/react-fontawesome'
import {faSync} from "@fortawesome/fontawesome-free-solid/shakable.es";
import {Button, Col} from "reactstrap";
import {setDeepProp} from "../../util";
import moment from 'moment';


class Blockoff extends Component {
    state = {
        blockoff: new BlockOffModel(this.props.start_time, this.props.end_time, this.props.team_id, this.props.staff_id),
        repeat: {
            active: false,
            amount: 1,
            mode: "w",
            repeatOn: "days",
            radioDays: {
                Su: false,
                Mo: false,
                Tu: false,
                We: false,
                Th: false,
                Fr: false,
                Sa: false,
            },
            end_time: moment(`${moment().format('YYYY')}-12-31 11:45 PM `),
        },
    };
    //blockoff
    changeBlockoffStartTime = (time) => {
        this.setState({blockoff: {...this.state.blockoff, start_time: time}});
    };
    changeBlockoffEndTime = (time) => {
        this.setState({blockoff: {...this.state.blockoff, end_time: time}});
    };
    createBlockOff = () => {
        const blockoff = {...this.state.blockoff};
        const repeat = {...this.state.repeat};
        if (repeat.active) {
            if (repeat.mode === "w") {
                let days=[];
                Object.values(repeat.radioDays).forEach((item, i) => {
                    if (item)
                        days.push(i);
                });
                blockoff.repeat = {
                    mode: repeat.mode,
                    amount: repeat.amount,
                    days,
                    end: repeat.end_time.toISOString()
                }
            }
            else {
                blockoff.repeat = {
                    mode: repeat.mode,
                    amount: repeat.amount,
                    end: repeat.end_time.toISOString()
                };
                if (repeat.repeatOn === "days")
                    blockoff.repeat.day = blockoff.start_time.day();
                else
                    blockoff.repeat.day = blockoff.start_time.date();
            }
        }
        else
            delete blockoff.repeat;
        blockoff.color = blockoff.color.substr(1);
        blockoff.start_time = this.state.blockoff.start_time.toISOString();
        blockoff.end_time = this.state.blockoff.end_time.toISOString();
        this.props.createBlockoff(this.props.user.selectedCompany.id, blockoff);
    };
    editBlockOff = () => {
        const blockoff = {...this.state.blockoff};
        blockoff.color = blockoff.color.substr(1);
        blockoff.start_time = this.state.blockoff.start_time.toISOString();
        blockoff.end_time = this.state.blockoff.end_time.toISOString();
        this.props.editBlockoff(this.props.user.selectedCompany.id, blockoff, blockoff.id);
    };
    handleBlockoffInput = (field, data) => {
        const blockoff = this.state.blockoff;

        if (field.indexOf(".") !== -1) {
            const fields = field.split(".");
            setDeepProp(blockoff, data, fields);
        } else {
            blockoff[field] = data;
        }
        this.setState({blockoff}, () => {
            if (field.includes("discount") || field === "tax")
                this.calculateTotalPrice()
        });
    };
    //repeat
    toggleRepeat = (e) => {
        this.setState({
            repeat: {
                ...this.state.repeat, active: e.currentTarget.value === 'Repeat',
                radioDays: {
                    Su: this.state.blockoff.start_time.format("dddd") === "Sunday",
                    Mo: this.state.blockoff.start_time.format("dddd") === "Monday",
                    Tu: this.state.blockoff.start_time.format("dddd") === "Tuesday",
                    We: this.state.blockoff.start_time.format("dddd") === "Wednesday",
                    Th: this.state.blockoff.start_time.format("dddd") === "Thursday",
                    Fr: this.state.blockoff.start_time.format("dddd") === "Friday",
                    Sa: this.state.blockoff.start_time.format("dddd") === "Saturday",
                }
            }
        });
    };
    toggleRepeatNumber = (e) => {
        this.setState({repeat: {...this.state.repeat, amount: e.currentTarget.value}});
    };
    toggleRepeatType = (e) => {
        this.setState({repeat: {...this.state.repeat, mode: e.currentTarget.value === "weeks" ? "w" : "m"}});
    };
    toggleRepeatOn = (e) => {
        this.setState({repeat: {...this.state.repeat, repeatOn: e.currentTarget.value}});
    };
    toggleRadioDays = (e) => {
        const days = {...this.state.repeat.radioDays};
        days[e.currentTarget.name] = !days[e.currentTarget.name];
        this.setState({
            repeat: {...this.state.repeat, radioDays: days}
        })
    };
    handleChangeEndTime = (date) => {
        this.setState({repeat: {...this.state.repeat, end_time: date}});
    };

    componentWillReceiveProps(newProps) {
        if (this.props.request.pending && newProps.request.fulfilled)
            this.props.closeModal();
    }

    componentWillMount() {
        if (!(this.props.staff.length > 0))
            this.props.getStaff(this.props.user.selectedCompany.id);
        if (this.props.blockoff) {
            if (this.props.blockoff.id === -1)
                this.setState({
                    blockoff: new BlockOffModel(this.props.start_time, this.props.end_time, this.props.team_id, this.props.staff_id)
                });
            else
                this.setState({blockoff: new BlockOffModel(this.props.blockoff)});
        }
    }

    render() {
        return (
            <Fragment>
                <BlockOffInfoForm
                    blockoff={this.state.blockoff}
                    staff={this.props.staff}
                    changeStartTime={(time) => this.changeBlockoffStartTime(time)}
                    changeEndTime={(time) => this.changeBlockoffEndTime(time)}
                    handleFormInput={this.handleBlockoffInput}
                    //repeat
                    repeat={this.state.repeat}
                    toggleRepeat={this.toggleRepeat}
                    toggleRepeatNumber={this.toggleRepeatNumber}
                    toggleRepeatType={this.toggleRepeatType}
                    toggleRepeatOn={this.toggleRepeatOn}
                    toggleRadioDays={this.toggleRadioDays}
                    handleChangeEndTime={this.handleChangeEndTime}
                />
                <Col className="d-flex p-0 justify-content-end" md={{size: 4, offset: 8}}>
                    <Button color="success"
                            disabled={this.props.request.pending}
                            onClick={() => this.props.blockoff.id === -1 ? this.createBlockOff() : this.editBlockOff()}>
                        {this.props.request.pending ? <Icon spin icon={faSync}/> : ''}
                        {this.props.blockoff.id > 0 ? "Edit Block Time" : "Create Block Time"}</Button>
                </Col>
            </Fragment>
        )

    }
}

function mapState(state) {
    return {
        errors: state.calendar.errors,
        user: state.user,
        staff: state.staff.staff,
        request: state.calendar.request
    }
}

function mapDispatch(dispatch) {
    return bindActionCreators({
        createBlockoff,
        editBlockoff,
        getStaff
    }, dispatch)
}

export default connect(mapState, mapDispatch)(Blockoff);
