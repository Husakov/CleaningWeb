import { auth, settings as settingsApi } from "../api";
import { addToForm, diff } from "../util";
import { toast } from "react-toastify";

const selectedCompany = localStorage.getItem("selectedCompany") || 0;
const initState = {
    pending: false,
    loaded: false,
}
export default function (state = {}, action) {
    switch (action.type) {
        case "GET_DATA_PENDING":
            return { ...state, pending: true, loaded: false }
        case "GET_DATA_FULFILLED":
            return { ...action.payload, selectedCompany: action.payload.companies[selectedCompany], pending: false, loaded: true };
        case "GET_DATA_REJECTED":
            return { error: action.payload };
        case "SELECT_COMPANY":
            localStorage.setItem("selectedCompany", state.companies.findIndex(c => c.id === action.company.id));
            return { ...state, selectedCompany: action.company };
        case "UPDATE_DASHBOARD":
            const newState = { ...state };
            newState.selectedCompany.dashboard = action.dashboard;
            return newState;
        default:
            return state;
    }
}

export const getData = () => ({
    type: "GET_DATA",
    payload: auth.me()
});

export const selectCompany = (company) => ({
    type: "SELECT_COMPANY",
    company
});
export const editCompany = (company_id, company) => {
    const data = new FormData();
    data.append("_method", "post");
    Object.keys(company).map(key => {
        if (company[key] === '') {
            company[key] = undefined;
        }
    });
    Object.keys(company).map(key => {
        addToForm(data, key, company[key])
    });
    return (dispatch) => {
        settingsApi.editCompanySettings(company_id, data)
            .then(res => dispatch(getData()), toast.success('Company edited'))
    }
}
export const editPayment = (company_id, payment) => {
    return (dispatch) => {
        settingsApi.editPaymentSettings(company_id, payment)
            .then(res => dispatch(getData()), toast.success('Payment edited'))
    }
}

export const updateDashboard = (dashboard) => ({
    type: "UPDATE_DASHBOARD",
    dashboard
});
