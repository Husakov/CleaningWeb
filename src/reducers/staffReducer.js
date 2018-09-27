import {roles as rolesapi, staff as staffapi, team as teamapi} from "../api";
import StaffModel from '../model/staff';
// import Staff from "../containers/Staff/Staff";

const initialState = {
    roles: [],
    staff: [],
    teams: [],
    inactive: [],
    selectedStaff: {pivot: {}},
    user: {fulfilled: false, error: false, pending: false},
    edit: {fulfilled: false, pending: false, error: false},
    teamState: {fulfilled: false, error: false, pending: false},
    deleted: false,
    avatars: [],
    errors: {},
    teamErrors: {}

};
export default function (state = initialState, action) {
    switch (action.type) {
        case "GET_ROLES_FULFILLED":
            return {
                ...state,
                roles: action.payload
            };
        case "GET_STAFF_FULFILLED":
            let teams = [];
            let inactive = [];
            for (let i = 0; i < action.payload.length; i++) {
                teams.push(action.payload[i]);
                //search for inactive users
                //and push them to inactive users
                for (let j = 0; j < action.payload[i].users.length; j++) {
                    action.payload[i].users[j].team_position = i;
                    action.payload[i].users[j].user_position = j;
                    if (!action.payload[i].users[j].active)
                        inactive.push(new StaffModel(action.payload[i].users[j]));
                }
            }
            return {
                ...state,
                staff: action.payload,
                teams: teams,
                inactive: inactive
            };
        case "EDIT_TEAM_REJECTED":
        case "CREATE_TEAM_REJECTED":
            return {
                ...state,
                teamState: {fulfilled: false, error: true, pending: false},
                teamErrors: action.payload.errors
            };
        case "EDIT_TEAM_PENDING":
        case "CREATE_TEAM_PENDING":
            return {
                ...state,
                teamState: {fulfilled: false, error: false, pending: true},
                teamErrors: null
            };
        case "CREATE_TEAM_FULFILLED":
            let team = action.payload;
            team.users = [];
            let staff = [...state.staff];
            staff.unshift(team);
            teams = [...state.teams];
            teams.unshift(team);
            return {
                ...state,
                staff: staff,
                teams: teams,
                teamState: {fulfilled: true, pending: false, error: false}
            };
        case "SELECT_STAFF":
            //sometimes team can be in two different positions
            action.payload.team_position = action.meta.team_position;
            action.payload.user_position = action.meta.user_position;

            return {
                ...state,
                selectedStaff: new StaffModel(action.payload)
            };
        case "REORDER_STAFF_FULFILLED":
            staff = [...state.staff];
            staff[action.meta.dragIndex].users.splice(action.meta.position, 1);
            staff[action.meta.dropIndex].users.push(action.payload);
            return {
                ...state,
                staff
            };
        case "CREATE_STAFF_PENDING":
            return {
                ...state,
                user: {...state.user, pending: true, fulfilled: false, error: false},
                errors: null
            };
        case "CREATE_STAFF_FULFILLED":
            staff = [...state.staff];
            if (action.payload.teams.length > 0) {
                for (let i = 0; i < state.teams.length; i++) {
                    if (action.payload.teams[0].pivot.team_id === state.teams[i].id) {
                        action.payload.team_position = i;
                        action.payload.user_position = staff[i].users.length - 1;
                        staff[i].users.unshift(action.payload);
                        inactive = [...state.inactive];
                        if (!action.payload.active)
                            inactive.push(action.payload);

                        return {
                            ...state,
                            staff: staff,
                            inactive: inactive,
                            user: {...state.user, fulfilled: true, error: false, pending: false}
                        };
                    }
                }
            }
            action.payload.team_position = state.staff.length - 1;
            action.payload.user_position = staff[state.staff.length - 1].users.length - 1;
            staff[state.staff.length - 1].users.push(action.payload);
            inactive = [...state.inactive];
            if (!action.payload.active)
                inactive.push(action.payload);

            return {
                ...state,
                staff: staff,
                inactive: inactive,
                user: {...state.user, fulfilled: true, error: false, pending: false}
            };
        case "CREATE_STAFF_REJECTED":
            return {
                ...state,
                user: {...state.user, fulfilled: false, error: true, pending: false},
                errors: action.payload.errors
            };
        case "EDIT_STAFF_PENDING":
            return {
                ...state,
                edit: {...state.edit, fulfilled: false, pending: true, error: false},
                errors: null
            };
        case "EDIT_STAFF_FULFILLED":
            if (action.payload.error) {
                return {
                    ...state,
                    error: action.payload.errors,
                    edit: {...state.edit, fulfilled: false, pending: false, error: true}
                };
            }
            staff = [...state.staff];

            let selectedStaff = {...state.selectedStaff};
            let finalPosition = selectedStaff.team_position;
            inactive = [...state.inactive];
            //change team if its changed during editing

            if (action.payload.teams.length > 0 && action.payload.teams[0].pivot.team_id !== selectedStaff.team_id) {
                for (let i = 0; i < state.staff.length; i++) {
                    if (action.payload.teams[0].pivot.team_id === state.staff[i].id) {

                        staff[selectedStaff.team_position].users.splice(selectedStaff.user_position, 1);
                        finalPosition = i;
                        break;
                    }
                }
                action.payload.team_position = finalPosition;
                action.payload.user_position = staff[selectedStaff.team_position].users.length;
                staff[finalPosition].users.push(action.payload);
            }

            let isAlreadyInInactive = false;
            let position = 0;
            for (let i = 0; i < inactive.length; i++) {
                if (inactive[i].id === action.payload.id) {
                    isAlreadyInInactive = true;
                    position = i;
                    inactive[i] = action.payload;
                }
            }
            if (!isAlreadyInInactive && !action.payload.active) {
                inactive.push(action.payload);
                staff[selectedStaff.team_position].users.splice(selectedStaff.user_position, 1);
            }
            if (isAlreadyInInactive && action.payload.active) {
                inactive.splice(position, 1);
                for (let i = 0; i < state.staff.length; i++) {
                    if (action.payload.teams[0].pivot.team_id === state.staff[i].id)
                        staff[i].users.push(action.payload)
                }
            }
            selectedStaff = action.payload;
            return {
                ...state,
                edit: {...state.edit, fulfilled: true, pending: false, error: false},
                staff: staff,
                selectedStaff: new StaffModel(selectedStaff),
                inactive: inactive
            };
        case "EDIT_STAFF_REJECTED":
            return {
                ...state,
                errors: action.payload.errors,
                edit: {...state.edit, fulfilled: false, pending: false, error: true},

            };
        case "DELETE_STAFF_PENDING":
            return {
                ...state,
                deleted: false
            };
        case "DELETE_STAFF_FULFILLED":
            staff = [...state.staff];
            inactive = [...state.inactive];
            if (!state.selectedStaff.active) {
                for (let i = 0; i < inactive.length; i++) {
                    if (state.selectedStaff.id = inactive[i].id)
                        inactive.splice(i, 1);
                }
            }
            staff[state.selectedStaff.team_position].users.splice(state.selectedStaff.user_position, 1);
            let obj = new StaffModel();
            return {
                ...state,
                staff: staff,
                selectedStaff: obj,
                inactive: inactive,
                deleted: true
            };
        case "DELETE_TEAM_FULFILLED":
            staff = [...state.staff];
            teams = [...state.teams];
            teams.splice(action.meta, 1);
            //push users to unassigned members when team deleted
            for (let i = 0; i < staff[action.meta].users.length; i++) {
                staff[action.meta].users[i].teams[0] = {pivot: {team_id: 0}};
                staff[state.staff.length - 1].users.push(staff[action.meta].users[i]);
            }
            staff.splice(action.meta, 1);
            return {
                ...state,
                staff: staff,
                teams: teams
            };

        case "EDIT_TEAM_FULFILLED":
            staff = [...state.staff];
            for (let i = 0; i < state.staff.length; i++) {
                if (staff[i].id === action.payload.id) {
                    //api doesnt return users
                    state.staff[i].name = action.payload.name;
                    state.staff[i].color = action.payload.color;
                    state.staff[i].timetable = action.payload.timetable;
                    state.staff[i].available = action.payload.available;
                }
            }
            return {
                ...state,
                staff: staff,
                teamState: {fulfilled: true, pending: false, error: false}
            };
        case "TOGGLE_STAFF_SERVICE_FULFILLED":
            staff = [...state.staff];
            staff[action.meta.staff.team_position].users[action.meta.staff.user_position].services = action.payload;
            selectedStaff = {...state.selectedStaff};
            selectedStaff.services = action.payload;
            return {
                ...state,
                staff,
                selectedStaff
            };
        case "REORDER_TEAM":
            staff = [...state.staff];
            const dragStaff = staff[action.drag];
            staff.splice(action.drag, 1);
            staff.splice(action.hover, 0, dragStaff);
            staff.forEach((staff, i) => {
                staff.order = i;
            });
            return {
                ...state,
                staff
            };
        case "GET_AVATARS_FULFILLED":
            return {
                ...state,
                avatars: action.payload
            };
        default:
            return state;
    }
}
export const create = (staff) => ({
    type: "CREATE_STAFF",
    payload: staffapi.create(staff)
});
export const edit = (staff, staff_id) => ({
    type: "EDIT_STAFF",
    payload: staffapi.edit(staff, staff_id)
});
export const deleteStaff = (staff_id) => ({
    type: "DELETE_STAFF",
    payload: staffapi.delete(staff_id)
});
export const getAvatars = () => ({
    type: "GET_AVATARS",
    payload: staffapi.avatars()
});
export const createTeam = (team) => ({
    type: "CREATE_TEAM",
    payload: teamapi.create(team),
    meta: {name: team.name}
});
export const getRoles = () => ({
    type: "GET_ROLES",
    payload: rolesapi.get
});
export const selectStaff = (staff, team_position, user_position) => ({
    type: "SELECT_STAFF",
    payload: staff,
    meta: {
        team_position,
        user_position,
    }
});
export const getStaff = (id) => ({
    type: "GET_STAFF",
    payload: staffapi.list(id)
});
export const reorderStaff = (position, dragIndex, dropIndex, staffId, teamId) => ({
    type: "REORDER_STAFF",
    payload: teamapi.assignTo(teamId, staffId),
    meta: {
        position,
        dragIndex,
        dropIndex
    }
});
export const deleteTeam = (id, index) => ({
    type: "DELETE_TEAM",
    payload: teamapi.delete(id),
    meta: index
});

export const editTeam = (id, team) => ({
    type: "EDIT_TEAM",
    payload: teamapi.edit(id, team)
});

export const toggleService = (staff_id, service_id, staff) => ({
    type: "TOGGLE_STAFF_SERVICE",
    payload: staffapi.toggleService(staff_id, service_id),
    meta: {staff}
});
export const reorderTeam = (drag, hover) => ({
    type: "REORDER_TEAM",
    drag,
    hover
});
export const saveReorderTeam = (team) => ({
    type: "SAVE_REORDER_TEAM",
    payload: teamapi.reorder(team)
});
