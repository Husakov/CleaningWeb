import { appointment, blockoff, quotes, staff } from "../api";
import { toast } from "react-toastify";

const initState = {
    events: [],
    staff: [],
    quotes: [],
    request: { pending: false, fulfilled: false, rejected: false },
    errors: [],
    generatingQuote: false,
    sendingMessage: { fulfilled: false, pending: false, rejected: false },
    messageErrors: []
};

export default function (state = initState, action) {
    let events;
    let idx;
    switch (action.type) {
        case "LOAD_STAFF_FULFILLED":
            return {
                ...state, staff: action.payload.filter(team => team.id === 0).reduce((arr, team) => {
                    team.users.filter(u => u.active).forEach(user => arr.push(user));
                    return arr;
                }, [])
            };
        case "LOAD_QUOTES_FULFILLED":
            return {
                ...state,
                quotes: action.payload.quotes.filter(q => q.is_in_waitlist)
            };
        case "LOAD_EVENTS_FULFILLED":
            let events = [];

            action.payload.appointments.forEach(e => {
                e.start = new Date(e.start_time);
                e.end = new Date(e.end_time);
                e.appointment = true;
                events.push(e);
            });

            action.payload.repeating_appointments.forEach((e, i) => {
                e.dates.forEach((evt, j) => {
                    //create new appointments from dates object
                    let newEvent = {
                        ...e,
                        start: new Date(evt.start_time),
                        end: new Date(evt.end_time),
                        recurring: true,
                        appointment: true,
                        repeat_id: "ra" + Date.now() + j + i
                    }
                    events.push(newEvent);
                })
            });

            action.payload.blockofftimes.forEach(e => {
                e.start = new Date(e.start_time);
                e.end = new Date(e.end_time);
                e.blockoff = true;
                events.push(e);
            });
            action.payload.repeating_blockofftimes.forEach((e, i) => {
                e.dates.forEach((evt, j) => {
                    //create new blocktimes from dates object
                    let newEvent = {
                        ...e,
                        start: new Date(evt.start_time),
                        end: new Date(evt.end_time),
                        recurring: true,
                        blockoff: true,
                        repeat_id: "rb" + Date.now() + j + i
                    }
                    events.push(newEvent);
                })
            });
            action.payload.user_offdays.forEach((e, i) => {
                e.start = new Date(e.from);
                e.end = new Date(e.to);
                e.offtime = true;
                //calendar crashes without it
                e.team_id = -1;
                e.staff_id = e.user_id;
                events.push(e);
            })
            return {
                ...state, events
            };
        case "REMOVE_QUOTE":
            const quotes = [...state.quotes];
            idx = quotes.findIndex(q => q.id === action.id);
            quotes.splice(idx, 1);
            return { ...state, quotes };
        case "CREATE_APPOINTMENT_PENDING":
            return {
                ...state,
                request: { pending: true, rejected: false, fulfilled: false }
            };
        case "CREATE_APPOINTMENT_REJECTED":
            return {
                ...state,
                errors: action.payload.errors,
                request: { pending: false, rejected: true, fulfilled: false },
            };
        case "CREATE_APPOINTMENT_FULFILLED":
            events = [...state.events];
            action.payload.forEach((event, i) => {
                let newEvent = {};
                if (i !== 0)
                    newEvent = {
                        ...event,
                        start: new Date(event.start_time),
                        end: new Date(event.end_time),
                        recurring: true,
                        repeating: true,
                        appointment: true,
                        repeat_id: "ra" + Date.now()
                    }
                else {
                    newEvent = {
                        ...event,
                        start: new Date(event.start_time),
                        end: new Date(event.end_time),
                        appointment: true,
                    }
                }
                events.push(newEvent);
            })
            toast.success(action.meta ? "Appointment & Quote Created" : "Appointment Created!");
            return {
                ...state,
                events,
                request: { pending: false, rejected: false, fulfilled: true },
                errors: []
            };
        case "CREATE_BLOCKOFF_PENDING":
            return {
                ...state,
                request: { pending: true, rejected: false, fulfilled: false }
            };
        case "CREATE_BLOCKOFF_REJECTED":
            return {
                ...state,
                errors: action.payload.errors,
                request: { pending: false, rejected: true, fulfilled: false },

            };
        case "CREATE_BLOCKOFF_FULFILLED":
            events = [...state.events];
            action.payload.forEach((event, i) => {
                let newEvent = {};
                if (i !== 0)
                    newEvent = {
                        ...event,
                        start: new Date(event.start_time),
                        end: new Date(event.end_time),
                        blockoff: true,
                        repeat_id: "rb" + Date.now()
                    }
                else {
                    newEvent = {
                        ...event,
                        start: new Date(event.start_time),
                        end: new Date(event.end_time),
                        blockoff: true,
                    }
                }
                events.push(newEvent);
            })
            toast.success("Blockoff time Created!");
            return {
                ...state,
                events,
                request: { pending: false, rejected: false, fulfilled: true },
                errors: []
            };
        case "EDIT_APPOINTMENT_PENDING":
            return {
                ...state,
                request: { pending: true, rejected: false, fulfilled: false }
            };
        case "EDIT_APPOINTMENT_REJECTED":
            toast.error(action.payload.message);
            return {
                ...state,
                errors: action.payload.errors,
                request: { pending: false, rejected: true, fulfilled: false },

            };
        case "EDIT_APPOINTMENT_FULFILLED":
            let index;
            events = [...state.events];
            action.payload.start = new Date(action.payload.start_time);
            action.payload.end = new Date(action.payload.end_time);
            index = events.findIndex(event => event.id === action.payload.id && event.appointment);
            events[index] = { ...action.payload, appointment: true };
            //repeating appts.
            events.forEach((event, i) => {
                if (event.id == action.payload.id && event.blockoff !== true && i != index)
                    //if start end becomes as response it will be in same time block as orignal
                    events[i] = {
                        ...action.payload, start: events[i].end, end: events[i].start,
                        recurring: true, repeat_id: "ra" + action.payload.id + i, appointment: true
                    };
            });
            toast.success("Appointment Edited!");
            return {
                ...state,
                events,
                request: { pending: false, rejected: false, fulfilled: true },
                errors: []
            };
        case "DELETE_APPOINTMENT_PENDING":
            return {
                ...state,
                request: { pending: true, rejected: false, fulfilled: false }
            };
        case "DELETE_APPOINTMENT_REJECTED":
            return {
                ...state,
                errors: action.payload.errors,
                request: { pending: false, rejected: true, fulfilled: false },

            };
        case "DELETE_APPOINTMENT_FULFILLED":
            events = [...state.events];
            let deletingEvents = [];
            let blockoffAndOfftime = [];
            //Because we have 3 types of events appts, blocktimes & offtimes
            //we first filter everything except appts
            blockoffAndOfftime = events.filter(evt => !evt.appointment);
            //filter appts and appointments that have different id from the one in payload
            events = events.filter(evt => evt.appointment).filter(evt => (action.payload.id !== evt.id));
            //push everything except appoitnemnts back to array
            blockoffAndOfftime.forEach(item => events.push(item));
            toast.success("Appointment(s) Deleted!");
            return {
                ...state,
                events,
                request: { pending: false, rejected: false, fulfilled: true },
                errors: []
            };
        case "EDIT_BLOCKOFF_PENDING":
            return {
                ...state,
                request: { pending: true, rejected: false, fulfilled: false }
            };
        case "EDIT_BLOCKOFF_REJECTED":
            return {
                ...state,
                errors: action.payload.errors,
                request: { pending: false, rejected: true, fulfilled: false },

            };
        case "EDIT_BLOCKOFF_FULFILLED":
            events = [...state.events];
            events = [...state.events];
            action.payload.start = new Date(action.payload.start_time);
            action.payload.end = new Date(action.payload.end_time);
            action.payload.blockoff = true;
            index = events.findIndex(event => event.id === action.payload.id && event.blockoff);
            events[index] = { ...action.payload };
            //repeating appts.
            events.forEach((event, i) => {
                if (event.id == action.payload.id && event.blockoff && i != index)
                    //if start end becomes as response it will be in same time block as orignal
                    events[i] = {
                        ...action.payload, start: events[i].end, end: events[i].start,
                        recurring: true, repeat_id: "rb" + i
                    };
            });
            toast.success("Blockoff Edited!");
            return {
                ...state,
                events,
                request: { pending: false, rejected: false, fulfilled: true },
                errors: []
            };
        case "DELETE_BLOCKOFF_PENDING":
            return {
                ...state,
                request: { pending: true, rejected: false, fulfilled: false }
            };
        case "DELETE_BLOCKOFF_REJECTED":
            return {
                ...state,
                errors: action.payload.errors,
                request: { pending: false, rejected: true, fulfilled: false },

            };
        case "DELETE_BLOCKOFF_FULFILLED":
            events = [...state.events];
            let appointmentsAndOfftime = [];
            appointmentsAndOfftime = events.filter(evt => !evt.blockoff);
            events = events.filter(evt => evt.blockoff).filter(evt => (action.payload.id !== evt.id));
            appointmentsAndOfftime.forEach(item => events.push(item));
            toast.success("Block Time(s) Deleted!");
            return {
                ...state,
                events,
                request: { pending: false, rejected: false, fulfilled: true },
                errors: []
            };
        case "GENERATE_QUOTE_PENDING":
            return {
                ...state,
                generatingQuote: true
            }
        case "GENERATE_QUOTE_FULFILLED":
            events = [...state.events];
            //repeating appts.
            events.forEach((event, i) => {
                if (event.id == action.payload.appointment_id && event.appointment)
                    events[i].quote = action.payload;
            });
            toast.success("Quote created!");
            return {
                ...state,
                events,
                generatingQuote: false
            }
        case "SEND_MESSAGE_PENDING":
            return {
                ...state,
                sendingMessage: { pending: true, fulfilled: false, rejected: false }
            }
        case "SEND_MESSAGE_REJECTED":
            toast.error((action.meta ? "Mail " : "Text ") + "could not be sent!")
            return {
                ...state,
                messageErrors: action.payload.errors,
                sendingMessage: { pending: false, fulfilled: false, rejected: true }
            }
        case "SEND_MESSAGE_FULFILLED":
            toast.success((action.meta ? "Mail " : "Text ") + "sent!")
            return {
                ...state,
                sendingMessage: { pending: false, fulfilled: true, rejected: false }
            }
        case "CLEAR_APPOINTMENT_ERRORS":
            return {
                ...state,
                errors: []
            }
        case "ADD_EVENT":
            action.event.start = new Date(action.event.start_time);
            action.event.end = new Date(action.event.end_time);
            return { ...state, events: [...state.events, action.event] };
        case "REPLACE_EVENT":
            events = [...state.events];
            idx = events.findIndex(e => e.id === action.event.id);
            events.splice(idx, 1, action.event);
            return { ...state, events };
        case "SET_EVENTS":
            return { ...state, events: action.events };
        default:
            return state;
    }
}

export const loadStaff = (companyID) => ({
    type: "LOAD_STAFF",
    payload: staff.list(companyID)
});

export const loadQuotes = (companyID) => ({
    type: "LOAD_QUOTES",
    payload: quotes.getQuotes(companyID, 0, 9999, [], [])
});

export const loadEvents = (companyID, start, end) => ({
    type: "LOAD_EVENTS",
    payload: appointment(companyID).list(start, end)
});

export const removeQuote = (id) => ({
    type: "REMOVE_QUOTE",
    id
});
export const clearErrors = () => ({
    type: "CLEAR_APPOINTMENT_ERRORS",
})
export const createAppointment = (companyID, appt, quote) => ({
    type: "CREATE_APPOINTMENT",
    payload: appointment(companyID).create(appt),
    meta: quote
});
export const editAppointment = (companyID, appt, id) => ({
    type: "EDIT_APPOINTMENT",
    payload: appointment(companyID).update(appt, id)
});
export const deleteAppointment = (companyID, id) => ({
    type: "DELETE_APPOINTMENT",
    payload: appointment(companyID).delete(id)
});
export const deleteBlockoff = (companyID, id) => ({
    type: "DELETE_BLOCKOFF",
    payload: blockoff(companyID).delete(id)
});
export const createBlockoff = (companyID, item) => ({
    type: "CREATE_BLOCKOFF",
    payload: blockoff(companyID).create(item)
});
export const editBlockoff = (companyID, item, id) => ({
    type: "EDIT_BLOCKOFF",
    payload: blockoff(companyID).update(item, id)
});
export const generateQuote = (companyId, apptId) => ({
    type: "GENERATE_QUOTE",
    payload: appointment(companyId).toQuote(apptId)
})
export const addEvent = (event) => ({
    type: "ADD_EVENT",
    event
});

export const replaceEvent = (event) => ({
    type: "REPLACE_EVENT",
    event
});

export const setEvents = (events) => ({
    type: "SET_EVENTS",
    events
});

export const sendMessage = (companyId, appointmentId, body, email = true) => ({
    type: "SEND_MESSAGE",
    payload: email ? appointment(companyId).sendMessage(appointmentId, body) : console.log("Nema apija za ovo govno"),
    meta: email
})
