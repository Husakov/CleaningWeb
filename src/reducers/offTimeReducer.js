import {offtime as offtimeApi} from "../api";

const initialState = {
    offtimes: [],
    offtime: {},
    offtimesTable: [],
    pending: false,
    error: false,
    fulfilled: false,
    getOffDatesFulfilled: false,
};

export default function (state = initialState, action) {
    switch (action.type) {
        case 'CREATE_OFFTIME_PENDING':
            return {
                ...state,
                pending: true,
                fulfilled: false,
            }
        case 'CREATE_OFFTIME_FULFILLED':
            return {
                ...state,
                pending: false,
                fulfilled: true,
                offtime: action.payload,
                offtimes: [...state.offtimes, action.payload]
            }
        case 'CREATE_OFFTIME_REPEAT_PENDING':
            return {
                ...state,
                pending: true,
                fulfilled: false,
            }
        case 'CREATE_OFFTIME_REPEAT_FULFILLED':
            let arr = [];
            action.payload.recurring_off_days.forEach(offt => {
                arr.push(
                    {
                        id: action.payload.id,
                        from: offt.pivot.from,
                        to: offt.pivot.to,
                        note: offt.pivot.note,
                        name: action.payload.name,
                        company_id: action.payload.company_id,
                        user: {
                            name: action.payload.name,
                            id: action.payload.id
                        }
                    }
                )
            });
            return {
                ...state,
                pending: false,
                fulfilled: true,
                offtimes: [...state.offtimes, ...arr],
            }
        case 'CREATE_OFFTIME_REJECTED':
            return {
                error: true,
                ...state,
            }
        case 'EDIT_OFFTIME_PENDING':
            return {
                ...state,
                pending: true,
                fulfilled: false,
            }
        case 'EDIT_OFFTIME_FULFILLED':
            let offtimes = [...state.offtimes];
            let index = offtimes.findIndex(time => time.id === action.payload.id);
            offtimes.splice(index, 1);
            return {
                ...state,
                pending: false,
                fulfilled: true,
                offtime: action.payload,
                offtimes: [...offtimes, action.payload]
            }
        case 'EDIT_OFFTIME_REJECTED':
            return {
                ...state,
                error: true,
            }
        case 'GET_OFFDATES_PENDING':
            return {
                ...state,
                fulfilled: false,
                pending: true,
                getOffDatesFulfilled: false,
            }
        case 'GET_OFFDATES_FULFILLED':
            return {
                ...state,
                pending: false,
                getOffDatesFulfilled: true,
                offtimes: [...action.payload],
            }
        case 'GET_OFFDATES_REJECTED':
            return {
                ...state,
                pending: false,
                error: true
            }
        case 'GET_OFFDATES_TABLE_PENDING':
            return {
                ...state,
                fulfilled: false,
                pending: true,
                getOffDatesFulfilled: false,
            }
        case 'GET_OFFDATES_TABLE_FULFILLED':
            return {
                ...state,
                pending: false,
                getOffDatesFulfilled: true,
                offtimesTable: [...action.payload],
            }
        case 'GET_OFFDATES_TABLE_REJECTED':
            return {
                ...state,
                pending: false,
                error: true
            }
        case 'DELETE_OFFTIME_PENDING':
            return {
                ...state,
                pending: true,
            }
        case 'DELETE_OFFTIME_REJECTED':
            return {
                ...state,
                pending: false,
                error: true,
            }
        case 'DELETE_OFFTIME_FULFILLED':
            offtimes = [...state.offtimes];
            index = offtimes.findIndex(time => time.id === action.payload.id);
            offtimes.splice(index, 1);
            return {
                ...state,
                pending: false,
                offtimes: [...offtimes]
            }
        case 'DELETE_ALL_OFFTIME_PENDING':
            return {
                ...state,
                pending: true,
            }
        case 'DELETE_ALL_OFFTIME_REJECTED':
            return {
                ...state,
                pending: false,
                error: true,
            }
        case 'DELETE_ALL_OFFTIME_FULFILLED':
            return {
                ...state,
                pending: false,
                offtimes: []
            }

        default:
            return {...state}
    }
}

export const createOffTime = (offtime, company_id) => ({
    type: "CREATE_OFFTIME",
    payload: offtimeApi.create(offtime, company_id)
});
export const editOffTime = (offtime, offtime_id) => ({
    type: "EDIT_OFFTIME",
    payload: offtimeApi.edit(offtime, offtime_id)
})
export const deleteOffTime = (company_id, offtime_id) => ({
    type: "DELETE_OFFTIME",
    payload: offtimeApi.delete(company_id, offtime_id)
})
export const deleteAllOffTime = (company_id, user_id, time) => ({
    type: "DELETE_ALL_OFFTIME",
    payload: offtimeApi.deleteAll(company_id, user_id, time)
})
export const repeatOffTime = (company_id, repeat) => ({
    type: "CREATE_OFFTIME_REPEAT",
    payload: offtimeApi.repeatOff(company_id, repeat)
});
export const getOffDates = (company_id, staff_id, from, to) => ({
    type: "GET_OFFDATES",
    payload: offtimeApi.getUserOffDays(company_id, staff_id, from, to)
})
export const getCompanyOffDays = (company_id, from, to) => ({
    type: "GET_OFFDATES_TABLE",
    payload: offtimeApi.getCompanyOffDays(company_id, from, to)
})
export const getTeamOffDays = (company_id, staff_id, from, to) => ({
    type: "GET_OFFDATES_TABLE",
    payload: offtimeApi.getTeamOffDays(company_id, staff_id, from, to)
})
export const getUserOffDays = (company_id, staff_id, from, to) => ({
    type: "GET_OFFDATES_TABLE",
    payload: offtimeApi.getUserOffDays(company_id, staff_id, from, to)
})
