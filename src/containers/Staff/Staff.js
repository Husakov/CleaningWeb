import React, { Component } from 'react';
import StaffDetails from '../../components/staff/StaffDetails';
import './Staff.css'

import { Button, Modal, ModalBody, ModalHeader } from 'reactstrap';

import withDragDropContext from "../../dnd-context";
import moment from 'moment';

import Icon from '@fortawesome/react-fontawesome'
import { faUser, faUsers } from '@fortawesome/fontawesome-free-solid/shakable.es';

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
    create,
    createTeam,
    deleteStaff,
    deleteTeam,
    edit,
    editTeam,
    getAvatars,
    getRoles,
    getStaff,
    reorderStaff,
    reorderTeam,
    saveReorderTeam,
    selectStaff,
    toggleService
} from '../../reducers/staffReducer';
import {
    createOffTime,
    deleteAllOffTime,
    deleteOffTime,
    editOffTime,
    getCompanyOffDays,
    getOffDates,
    getTeamOffDays,
    getUserOffDays,
    repeatOffTime
} from '../../reducers/offTimeReducer';
import { getList } from '../../reducers/serviceReducer';

import Team from '../../components/staff/Team';
import InactiveMembers from '../../components/staff/InactiveMembers';
import TeamDetails from '../../components/staff/TeamDetails';


class Staff extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hoverIndex: null,
            isCreateClicked: true,
            isTeamCreateClicked: true,
            createTeam: false,
            teamName: "",
            color: "#4286f4",
            pickerActive: false,
            isTeamOpen: false,
            team: {
                name: "",
                color: "#4286f4",
                timetable: [],
                available: false
            },
            hours: [],
            selectedStaffTimetable: []
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
        this.setState({ hours: sati })
        this.props.getRoles();
        this.props.getAvatars();
        if (this.props.user.id) {
            this.props.getStaff(this.props.user.selectedCompany.id);
            this.props.getServices(this.props.user.selectedCompany.id);
        }
    }

    componentWillReceiveProps(newProps) {
        if (newProps.user.id !== this.props.user.id) {
            this.props.getStaff(newProps.user.companies[0].id);
            this.props.getServices(newProps.user.companies[0].id);
        }
        if (newProps.deleted !== this.props.deleted && newProps.deleted)
            this.setState({ isCreateClicked: true });
    }

    hovering(hoverIndex) {
        this.setState({ hoverIndex })
    }

    moveStaff(position, dragIndex, dropIndex, staffId, teamId) {
        this.props.reorderStaff(position, dragIndex, dropIndex, staffId, teamId);
    }

    selectStaff(user, team_position, user_position) {
        for (let team of this.props.staff) {
            if (user.pivot && user.pivot.team_id === team.id) {
                this.setState({ selectedStaffTimetable: team.timetable });
                break;
            }
            else {
                this.setState({ selectedStaffTimetable: this.props.user.selectedCompany.timetable });
            }
        }
        this.props.getOffDates(user.company_id, user.id, `${moment().format('YYYY')}-01-01 12:00 AM`, `${moment().format('YYYY')}-12-31 11:00 PM`);
        this.props.getUserOffDays(user.company_id, user.id, `${moment().format('YYYY')}-01-01 12:00 AM`, `${moment().format('YYYY')}-12-31 11:00 PM`);
        this.props.selectStaff(user, team_position, user_position);
        this.setState({ isCreateClicked: false, createTeam: false });
    }

    createTeam(teamName, color, timetable, available) {
        let body = {
            name: teamName,
            color: color,
            company_id: this.props.user.selectedCompany.id,
            timetable: timetable,
            available: available
        }
        this.props.createTeam(body);
    }

    reorderTeams() {
        let body = {
            company_id: this.props.user.selectedCompany.id,
            teams: this.props.staff.reduce((map, s, i) => ({ ...map, [s.id]: i }), {})
        }
        delete body.teams[0];
        this.props.saveReorderTeam(body)
    }

    openTeam(team = {
        name: "", color: "#4286f4",
        timetable: this.props.user.selectedCompany.timetable,
        available: false
    }) {
        this.setState({ isTeamOpen: !this.state.isTeamOpen, team: team })
    }

    render() {
        return (
            <div className="Staff container-fluid">
                <div className="row">
                    <div className="staff-list col-md-3  col-xs-12">
                        <div className="staff-list-header">
                            <h4>Staff Members</h4>
                            <Button className="add-user-button"
                                onClick={() => this.setState({ isCreateClicked: true })}>
                                <Icon icon={faUser} /> Add Staff
                            </Button>
                        </div>
                        <Button
                            onClick={() => this.openTeam()}
                            className="create-team-button">
                            <Icon icon={faUsers} /> Create Team
                        </Button>
                        {this.props.staff.map((team, i) => {
                            return (
                                <Team
                                    openTeam={(team) => this.openTeam(team)}
                                    key={team.id}
                                    hovering={(hoverIndex) => {
                                        this.hovering(hoverIndex)
                                    }}
                                    hoverIndex={this.state.hoverIndex}
                                    team={team}
                                    index={i}
                                    deleteTeam={(id) => this.props.deleteTeam(id, i)}
                                    selectStaff={(user, team_position, user_position, team_id) => this.selectStaff(user, team_position, user_position, team_id)}
                                    reorderTeam={this.props.reorderTeam}
                                    saveReorderTeam={() => this.reorderTeams()}
                                    unassignedIndex={this.props.staff.length - 1}
                                    moveStaff={(position, dragIndex, dropIndex, staffId, teamId) => this.moveStaff(position, dragIndex, dropIndex, staffId, teamId)}
                                />
                            )
                        })}
                        <InactiveMembers team={this.props.inactive}
                            selectStaff={(user, team_position, user_position, team_id) => this.selectStaff(user, team_position, user_position, team_id)}
                        />
                        <Modal className="modal-lg" isOpen={this.state.isTeamOpen} toggle={() => this.openTeam()}>
                            <ModalHeader toggle={() => this.openTeam()}>
                                Create Team
                            </ModalHeader>
                            <ModalBody>
                                <TeamDetails
                                    handleFormInput={(field, data) => {
                                        this.handleFormInput(field, data)
                                    }}
                                    team={this.state.team}
                                    hours={this.state.hours}
                                    create={(name, color, timetable, available) => this.createTeam(name, color, timetable, available)}
                                    editTeam={(id, body) => this.props.editTeam(id, body)}
                                    toggle={() => this.openTeam()}
                                    errors={this.props.teamErrors}
                                    state={this.props.teamState}
                                />
                            </ModalBody>
                        </Modal>
                    </div>
                    <div className="staff-details col-md-9 col-xs-12">
                        <StaffDetails
                            user={this.props.user}
                            created={this.props.created}
                            edited={this.props.edited}
                            createUser={this.state.isCreateClicked}
                            editStaff={(staff, id) => this.props.editStaff(staff, id)}
                            create={(staff) => this.props.create(staff)}
                            deleteStaff={(staff_id) => this.props.deleteStaff(staff_id)}
                            selectedStaff={this.props.selectedStaff}
                            roles={this.props.roles}
                            teams={this.props.teams}
                            services={this.props.services}
                            toggleService={(staff_id, service_id, staff) => this.props.toggleService(staff_id, service_id, staff)}
                            avatars={this.props.avatars}
                            errors={this.props.errors}
                            selectedStaffTimetable={this.state.selectedStaffTimetable}
                            staff={this.props.staff}
                            offtime={this.props.offtime}
                            offtimes={this.props.offtimes}
                            createOffTime={this.props.createOffTime}
                            editOffTime={this.props.editOffTime}
                            deleteOffTime={this.props.deleteOffTime}
                            deleteAllOffTime={this.props.deleteAllOffTime}
                            repeatOffTime={this.props.repeatOffTime}
                            getOffDates={this.props.getOffDates}
                            getCompanyOffDays={this.props.getCompanyOffDays}
                            getTeamOffDays={this.props.getTeamOffDays}
                            getUserOffDays={this.props.getUserOffDays}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        services: state.service.services,
        roles: state.staff.roles,
        staff: state.staff.staff,
        offtime: state.offtime,
        offtimes: state.offtime.offtimes,
        teams: state.staff.teams,
        selectedStaff: state.staff.selectedStaff,
        user: state.user,
        created: state.staff.user,
        edited: state.staff.edit,
        deleted: state.staff.deleted,
        inactive: state.staff.inactive,
        avatars: state.staff.avatars,
        errors: state.staff.errors,
        teamState: state.staff.teamState,
        teamErrors: state.staff.teamErrors
    };
};
const mapDispatchToProps = dispatch => {
    return bindActionCreators(
        {
            getRoles,
            getStaff,
            selectStaff,
            reorderStaff,
            deleteStaff,
            create,
            createTeam,
            editStaff: edit,
            createOffTime,
            editOffTime,
            deleteOffTime,
            deleteAllOffTime,
            repeatOffTime,
            getOffDates,
            getCompanyOffDays,
            getTeamOffDays,
            getUserOffDays,
            deleteTeam,
            editTeam,
            getServices: getList,
            toggleService,
            reorderTeam,
            saveReorderTeam,
            getAvatars
        },
        dispatch
    );
};
export default connect(mapStateToProps, mapDispatchToProps)(withDragDropContext(Staff));
