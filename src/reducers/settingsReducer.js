import {settings as settingsApi} from "../api";

const initialState = {
    loading: false,
    loaded: false,
    error: undefined
}
export default function (state = initialState, action) {
    switch (action.type) {
        case 'EDIT_COMPANY_PENDING':
            return {
                ...state,
                loading: true,
                loaded: false,
            }
        case 'EDIT_COMPANY_REJECTED':
            return {
                ...state,
                loading: false,
                loaded: false,
                error: action.payload
            }
        case 'EDIT_COMPANY_FULFILLED':
            return {
                ...state,
                loading: false,
                loaded: true,
            }
        case 'EDIT_PAYMENT_PENDING':
            return {
                ...state,
                loading: true,
                loaded: false,
            }
        case 'EDIT_PAYMENT_REJECTED':
            return {
                ...state,
                loading: false,
                loaded: false,
                error: action.payload
            }
        case 'EDIT_PAYMENT_FULFILLED':
            return {
                ...state,
                loading: false,
                loaded: true,
            }
        default:
            return state;
    }
}

// export const editCompany = (company_id, company) => ({
//     type: "EDIT_COMPANY",
//     payload: settingsApi.editCompanySettings(company_id, company)
// });
//
// export const editPayment = (company_id, payment) => ({
//
// })

