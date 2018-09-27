import {combineReducers} from "redux";

import register from './registerReducer';
import login from './loginReducer';
import service from './serviceReducer';
import user from './userReducer';
import staff from './staffReducer';
import offtime from './offTimeReducer';
import customer from './customerReducer';
import message from './messagesReducer'
import quotes from './quotesReducer';
import calendar from './calendarReducer';
import settings from './settingsReducer';
import userdetails from './customerAppointmentsReducer';
import chat from './chatReducer';

export default combineReducers({
    userdetails,
    calendar,
    register,
    login,
    service,
    user,
    staff,
    offtime,
    customer,
    message,
    quotes,
    settings,
    chat
});
