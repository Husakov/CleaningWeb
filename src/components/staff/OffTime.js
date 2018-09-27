import React, {Component} from 'react';
import './OffTime.css';
import Moment from 'moment';
import {extendMoment} from 'moment-range';
import {Calendar, CalendarControls} from 'react-yearly-calendar';
import {
    Button,
    ButtonDropdown,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Table,
    Popover,
    PopoverHeader,
    PopoverBody,
    Alert
} from 'reactstrap';
import Spinner from 'react-spinkit';
import OffTimeModal from './OffTimeModal';
import DeleteModal from './DeleteModal';
import {faTrashAlt} from "@fortawesome/fontawesome-free-solid/shakable.es";
import Icon from '@fortawesome/react-fontawesome'

const moment = extendMoment(Moment);

class OffTime extends Component {
    constructor(props) {
        super(props);
        const today = moment();
        const customCSSclasses = {
            holidays: ['2018-05-25', '2018-05-01', '2018-06-02', '2018-05-15', '2018-6-01'],
            spring: {
                start: '2018-03-21',
                end: '2018-6-20'
            },
            summer: {
                start: '2018-06-21',
                end: '2018-09-22'
            },
            autumn: {
                start: '2018-09-23',
                end: '2018-12-21'
            },
            weekend: 'Sat,Sun',
            offtime: [],
            winter: day => day.isBefore(moment([2018, 2, 21])) || day.isAfter(moment([2018, 11, 21]))
        }
        this.state = {
            popoverOpen: false,
            modal: false,
            deleteModal: false,
            deleteType: 'single',
            editMode: false,
            hoverDate: '',
            hoverTarget: '',
            startDate: moment(),
            endDate: moment(),
            predefinedLabel: '',
            radioBtn: 'no',
            disableRadioBtn: false,
            showBtn: 'show-user',
            note: '',
            noteLength: 0,
            notePreview: '',
            showNote: false,
            allDates: [],
            sortedOfftime: [],
            offtimeID: '',
            offtimeCompanyID: Number,
            offtimeIndex: Number,
            showWarning: false,
            moreOpen: false,
            deleteOpen: false,
            //repeat
            radioDays: {
                Su: false,
                Mo: false,
                Tu: false,
                We: false,
                Th: false,
                Fr: false,
                Sa: false,
            },
            firstWeek: false,
            repeat: false,
            repeatNumber: 1,
            repeatType: 'weeks',
            repeatOn: '',
            repeatEndTime: moment(`${moment().format('YYYY')}-12-31 11:45 A`, 'YYYY-MM-DD hh:mm A'),
            //end
            //calendar
            year: today.year(),
            selectedDay: today,
            selectedRange: [today, moment(today).add(15, 'day')],
            showDaysOfWeek: true,
            showTodayBtn: true,
            showWeekSeparators: true,
            selectRange: false,
            firstDayOfWeek: 0, // sunday
            customCSSclasses,
            //end
        }
    }

    componentWillReceiveProps(nextProps) {
        if (JSON.stringify(nextProps.offtime.offtimesTable) !== JSON.stringify(this.props.offtime.offtimesTable)) {
            this.setState({
                sortedOfftime: nextProps.offtime.offtimesTable
            });
        }
        const {offtimes} = this.props;
        if (nextProps.offtime.getOffDatesFulfilled && !nextProps.offtime.pending && (JSON.stringify(offtimes) !== JSON.stringify(nextProps.offtimes))) {
            this.formatNewDates(nextProps.offtimes);
        }
        if (JSON.stringify(offtimes) !== JSON.stringify(nextProps.offtimes)) {
            this.props.getOffDates(this.props.selectedStaff.company_id, this.props.selectedStaff.id, `${moment().format('YYYY')}-01-01 12:00 AM`, `${moment().format('YYYY')}-12-31 11:00 PM`);
            this.props.getUserOffDays(this.props.selectedStaff.company_id, this.props.selectedStaff.id, `${moment().format('YYYY')}-01-01 12:00 AM`, `${moment().format('YYYY')}-12-31 11:00 PM`);
        }
    }

    formatNewDates = (offtimes) => {
        let custom = {...this.state.customCSSclasses};
        let dates = [];
        let allDates = [];
        let rangeArr = [];
        let range = moment.range();
        custom.offtime = [];
        if (offtimes.length) {
            for (let date of offtimes) {
                range = moment.range(date.from, date.to);
                rangeArr = Array.from(range.by('day'));
                dates = rangeArr.map(date => date.format('YYYY-MM-DD'));
                allDates = [...allDates, [...rangeArr.map(date => date.format('YYYY-MM-DD'))]];
                custom.offtime = [...custom.offtime, ...dates];
            }
        }
        this.setState({customCSSclasses: {...custom}, allDates: [...allDates]});
    }
    togglePopUp = () => {
        console.log('toggle');
        this.setState({
            popoverOpen: !this.state.popoverOpen
        });
    }
    toggleModal = () => {
        let days = {...this.state.radioDays};
        for (let d in days) {
            days[d] = false;
        }
        this.setState({
            modal: !this.state.modal,
            radioDays: {...days}
        });
    }
    toggleDeleteModal = () => {
        this.setState({
            deleteModal: !this.state.deleteModal
        });
    }
    onDayMouseLeave = () => {
        // this.setState({ popoverOpen: false });
    }
    onDayHover = (date) => {
        // this.setState({ hoverDate: moment(date).format('MM/DD/YYYY'), hoverTarget: `t${moment(date).format('x').toString()}` });
    }
    //datepicker
    handleChangeStart = (date) => {
        let day = {...this.state.radioDays};
        for (let d in day) {
            day[d] = false;
        }
        day[moment(date).format('dd')] = true;
        this.setState({
            startDate: date,
            endDate: moment(date).add(15, 'm'),
            predefinedLabel: 'Custom',
            disableRadioBtn: false,
            radioDays: {...day}
        });
        if (this.checkDate(date)) {
            this.setState({showWarning: true});
        } else {
            if (this.state.showWarning) {
                this.setState({showWarning: false});
            }
        }
    }
    handleChangeEnd = (date) => {
        let days = {...this.state.radioDays};
        for (let d in days) {
            days[d] = false;
        }
        let range = moment.range(this.state.startDate, date);
        range = Array.from(range.by('day'));
        range.forEach(d => {
            days[d.format('dd')] = true;
        });
        let disable = this.state.startDate.format('YYYY-MM-DD') !== date.format('YYYY-MM-DD');
        this.setState({
            endDate: date,
            predefinedLabel: 'Custom',
            disableRadioBtn: disable,
            radioDays: days
        });
        if (this.checkDate(date)) {
            this.setState({showWarning: true});
        } else {
            if (this.state.showWarning) {
                this.setState({showWarning: false});
            }
        }
    }
    saveModal = () => {
        this.saveOffTime();
    }
    deleteModal = () => {
        if (this.state.deleteType === 'single') {
            this.props.deleteOffTime(this.state.offtimeCompanyID, this.state.offtimeID);
            this.setState({modal: false, deleteModal: false});
        } else {
            this.deleteAll(this.state.deleteType);
            this.setState({modal: false, deleteModal: false});
        }
    }
    deleteAll = (type) => {
        let time = {
            from: '',
            to: ''
        }
        switch (type) {
            case 'past':
                time.from = moment(`${moment().format('YYYY')}-1-1`).format('YYYY-M-D');
                time.to = moment().format('YYYY-M-D');
                this.props.deleteAllOffTime(this.props.selectedStaff.company_id, this.props.selectedStaff.id, time);
                break;
            case 'future':
                time.from = moment().format('YYYY-M-D');
                time.to = moment(`${moment().format('YYYY')}-12-31`).format('YYYY-M-D');
                this.props.deleteAllOffTime(this.props.selectedStaff.company_id, this.props.selectedStaff.id, time);
                break;
            default:
                time.from = moment(`${moment().format('YYYY')}-1-1`).format('YYYY-M-D');
                time.to = moment(`${moment().format('YYYY')}-12-31`).format('YYYY-M-D');
                this.props.deleteAllOffTime(this.props.selectedStaff.company_id, this.props.selectedStaff.id, time);
        }
    }
    saveOffTime = () => {
        const {startDate, endDate, customCSSclasses, allDates, notePreview, offtimeID, offtimeCompanyID, editMode, offtimeIndex, radioBtn} = this.state;
        const range = moment.range(startDate, endDate);
        const rangeArr = Array.from(range.by('day'));
        const days = rangeArr.map(day => day.format('YYYY-MM-DD'));
        let custom = {...customCSSclasses};
        let all = [...allDates];
        if (editMode) {
            let editedOfftime = {
                from: startDate.format('YYYY-MM-DD hh:mm A'),
                to: endDate.format('YYYY-MM-DD hh:mm A'),
                note: notePreview
            }
            all[offtimeIndex] = [...days];
            custom.offtime = all.reduce((a, b) => a.concat(b), []);
            this.checkRadioBtn(radioBtn, editedOfftime, offtimeID, offtimeCompanyID, editMode);
        } else {
            if (days.some(date => customCSSclasses.offtime.includes(date))) {
                for (let i = 0; i < allDates.length; i++) {
                    if (days.some(date => allDates[i].includes(date))) {
                        all.splice(i, 1);
                        let newCustom = {...customCSSclasses};
                        newCustom.offtime = all.reduce((a, b) => a.concat(b), []);
                        this.props.deleteOffTime(this.props.offtimes[i].company_id, this.props.offtimes[i].id);
                        this.setState({allDates: [...all], customCSSclasses: {...newCustom}});
                        break;
                    }
                }
            }
            let offtime = {
                user_id: this.props.selectedStaff.id,
                from: startDate.format('YYYY-MM-DD hh:mm A'),
                to: endDate.format('YYYY-MM-DD hh:mm A'),
                note: notePreview
            }
            custom.offtime = [...custom.offtime, ...days];
            this.checkRadioBtn(radioBtn, offtime, offtimeID, offtimeCompanyID, editMode);
        }
        let repDays = [];
        for (let day in this.state.radioDays) {
            if (day === 'Su' && this.state.radioDays[day]) {
                repDays.push(0);
            } else if (day === 'Mo' && this.state.radioDays[day]) {
                repDays.push(1);
            } else if (day === 'Tu' && this.state.radioDays[day]) {
                repDays.push(2);
            } else if (day === 'We' && this.state.radioDays[day]) {
                repDays.push(3);
            } else if (day === 'Th' && this.state.radioDays[day]) {
                repDays.push(4);
            } else if (day === 'Fr' && this.state.radioDays[day]) {
                repDays.push(5);
            } else if (day === 'Sa' && this.state.radioDays[day]) {
                repDays.push(6);
            }
        }
        let repeat = {
            user_id: this.props.selectedStaff.id,
            amount: this.state.repeatNumber,
            mode: this.state.repeatType[0],
            days: [...repDays],
            start: startDate.format('YYYY-MM-DD'),
            end: this.state.repeatEndTime.format('YYYY-MM-DD'),
            from: startDate.format('YYYY-MM-DD hh:mm A'),
            to: endDate.format('YYYY-MM-DD hh:mm A'),
            note: this.state.note,
            include_first: this.state.firstWeek
        };
        if (this.state.repeatOn !== '') {
            if (this.state.repeatOn === 'day') {
                repeat.day = moment(this.state.startDate).day()
            } else {
                repeat.date = this.state.startDate.format('DD')
            }
        }
        if (this.state.repeat) {
            this.props.repeatOffTime(this.props.selectedStaff.company_id, repeat);
        }
    }
    checkRadioBtn = (radioBtn, offtime, offtimeID, offtimeCompanyID, editMode) => {
        let off = {};
        if (editMode) {
            off = {
                from: this.state.startDate.format('YYYY-MM-DD hh:mm A'),
                to: this.state.endDate.format('YYYY-MM-DD hh:mm A'),
                note: this.state.notePreview
            }
        } else {
            off = {
                user_id: this.props.selectedStaff.id,
                from: this.state.startDate.format('YYYY-MM-DD hh:mm A'),
                to: this.state.endDate.format('YYYY-MM-DD hh:mm A'),
                note: this.state.notePreview
            }
        }
        switch (radioBtn) {
            case 'month':
                if (!editMode) {
                    this.props.createOffTime(off, this.props.selectedStaff.company_id);
                }
                let repeat = moment(offtime.from, 'YYYY-MM-DD hh:mm A').add(7, 'days').format('YYYY-MM-DD hh:mm A');
                off.from = moment(off.from, 'YYYY-MM-DD hh:mm A').add(7, 'days');
                off.to = moment(off.to, 'YYYY-MM-DD hh:mm A').add(7, 'days');
                while (moment(repeat, 'YYYY-MM-DD hh:mm A').format('YYYY-MM') === moment(offtime.from, 'YYYY-MM-DD hh:mm A').format('YYYY-MM')) {
                    if (!this.checkDate(repeat)) {
                        this.props.createOffTime(off, this.props.selectedStaff.company_id);
                    }
                    repeat = moment(repeat, 'YYYY-MM-DD hh:mm A').add(7, 'days');
                    off.from = moment(off.from, 'YYYY-MM-DD hh:mm A').add(7, 'days');
                    off.to = moment(off.to, 'YYYY-MM-DD hh:mm A').add(7, 'days');
                }
                this.setState({modal: false, disableRadioBtn: false, radioBtn: 'no'});
                break;
            case 'year':
                if (!editMode) {
                    this.props.createOffTime(off, this.props.selectedStaff.company_id);
                }
                repeat = moment(offtime.from, 'YYYY-MM-DD hh:mm A').format('YYYY-MM-DD hh:mm A');
                off.from = moment(off.from, 'YYYY-MM-DD hh:mm A').add(7, 'days');
                off.to = moment(off.to, 'YYYY-MM-DD hh:mm A').add(7, 'days');
                while (moment(repeat, 'YYYY-MM-DD hh:mm A').format('YYYY') === moment(offtime.from, 'YYYY-MM-DD hh:mm A').format('YYYY')) {
                    if (!this.checkDate(repeat)) {
                        this.props.createOffTime(off, this.props.selectedStaff.company_id);
                    }
                    repeat = moment(repeat, 'YYYY-MM-DD hh:mm A').add(7, 'days');
                    off.from = moment(off.from, 'YYYY-MM-DD hh:mm A').add(7, 'days');
                    off.to = moment(off.to, 'YYYY-MM-DD hh:mm A').add(7, 'days');
                }
                this.setState({modal: false, disableRadioBtn: false, radioBtn: 'no'});
                break;
            default:
                let days = {...this.state.radioDays};
                for (let d in days) {
                    days[d] = false;
                }
                if (editMode) {
                    this.props.editOffTime(offtime, offtimeID, offtimeCompanyID);
                    this.setState({modal: false, disableRadioBtn: false, radioBtn: 'no', radioDays: {...days}});
                } else {
                    this.props.createOffTime(offtime, this.props.selectedStaff.company_id);
                    this.setState({modal: false, disableRadioBtn: false, radioBtn: 'no', radioDays: {...days}});
                }
        }
    }
    checkDate = (date) => {
        if (this.state.customCSSclasses.offtime.includes(moment(date).format('YYYY-MM-DD'))) {
            return true;
        } else {
            return false;
        }
    }
    predefinedRange = (label) => {
        switch (label) {
            case 'Today':
                this.setState({
                    startDate: moment(`${moment().format('YYYY-MM-DD')} 08:00 AM`),
                    endDate: moment(`${moment().format('YYYY-MM-DD')} 04:00 PM`),
                });
                this.togglePredefinedClass(label);
                break;
            case 'Yesterday':
                this.setState({
                    startDate: moment(`${moment().subtract(1, 'days').format('YYYY-MM-DD')} 08:00 AM`),
                    endDate: moment(`${moment().subtract(1, 'days').format('YYYY-MM-DD')} 04:00 PM`)
                });
                this.togglePredefinedClass(label);
                break;
            case 'Tomorrow':
                this.setState({
                    startDate: moment(`${moment().add(1, 'days').format('YYYY-MM-DD')} 08:00 AM`),
                    endDate: moment(`${moment().add(1, 'days').format('YYYY-MM-DD')} 04:00 PM`)
                });
                this.togglePredefinedClass(label);
                break;
            default:
                this.togglePredefinedClass(label);
        }
    }
    togglePredefinedClass = (label) => {
        this.setState({predefinedLabel: label});
    }
    onRadioChange = (e) => {
        this.setState({radioBtn: e.currentTarget.value});
    }
    onShowChange = (e) => {
        this.setState({showBtn: e.currentTarget.value});
    }
    onChangeNote = (e) => {
        this.setState({note: e.target.value, noteLength: e.target.value.length})
    }
    addNote = () => {
        this.setState({showNote: !this.state.showNote, notePreview: !this.state.showNote ? this.state.note : ''});
    }
    sortOfftime = (by) => {
        let sortArr = this.props.offtime.offtimesTable;
        if (by === 'start') {
            sortArr.sort((a, b) => {
                return new Date(moment(a.from).format('YYYY-MM-DD')) - new Date(moment(b.from).format('YYYY-MM-DD'));
            });
        } else if (by === 'end') {
            sortArr.sort((a, b) => {
                return new Date(moment(a.from).format('YYYY-MM-DD')) - new Date(moment(b.from).format('YYYY-MM-DD'));
            }).reverse();
        } else if (by === 'name') {
            sortArr.sort((a, b) => {
                return a.user.name > b.user.name;
            });
        }
        this.setState({sortedOfftime: [...sortArr]});
    }
    toggleMore = () => {
        this.setState({moreOpen: !this.state.moreOpen});
    }
    toggleDelete = () => {
        this.setState({deleteOpen: !this.state.deleteOpen});
    }
    //repeat
    resetRepeat = () => {
        this.setState({
            repeat: false,
            repeatNumber: 1,
            repeatType: 'weeks',
            repeatOn: '',
            radioDays: {
                Su: false,
                Mo: false,
                Tu: false,
                We: false,
                Th: false,
                Fr: false,
                Sa: false,
            },
            repeatEndTime: moment(`${moment().format('YYYY')}-12-31 11:45 A`, 'YYYY-MM-DD hh:mm A')
        });
    }
    toggleRadioDays = (e) => {
        let days = {...this.state.radioDays};
        days[e.currentTarget.name] = !days[e.currentTarget.name];
        this.setState({
            radioDays: {...days}
        })
    }
    toggleFirstWeek = (e) => {
        this.setState({firstWeek: !this.state.firstWeek});
    }

    toggleRepeat = (e) => {
        this.setState({repeat: e.currentTarget.value === 'Repeat' ? true : false});
    }
    toggleRepeatNumber = (e) => {
        this.setState({repeatNumber: e.currentTarget.value});

    }
    toggleRepeatType = (e) => {
        if (e.currentTarget.value === 'weeks') {
            this.setState({repeatType: e.currentTarget.value, repeatOn: ''});
        } else {
            this.setState({repeatType: e.currentTarget.value, repeatOn: 'day'});
        }
    }
    toggleRepeatOn = (e) => {
        this.setState({repeatOn: e.currentTarget.value});

    }
    handleChangeEndTime = (date) => {
        this.setState({repeatEndTime: date});
    }

    //calendar related
    onPrevYear() {
        this.setState(prevState => ({
            year: prevState.year - 1
        }));
    }

    onNextYear() {
        this.setState(prevState => ({
            year: prevState.year + 1
        }));
    }

    goToToday() {
        const today = moment();

        this.setState({
            selectedDay: today,
            selectedRange: [today, moment(today).add(15, 'day')],
            year: today.year()
        });
    }

    setEditOfftime = (offtimes, customClasses, allDates, date) => {
        for (let i = 0; i < allDates.length; i++) {
            if (allDates[i].includes(String(date))) {
                this.setState({
                    startDate: moment(offtimes[i].from),
                    endDate: moment(offtimes[i].to),
                    note: offtimes[i].note ? offtimes[i].note : '',
                    noteLength: offtimes[i].note ? offtimes[i].note.length : 0,
                    editMode: true,
                    offtimeID: offtimes[i].id,
                    offtimeCompanyID: offtimes[i].company_id,
                    offtimeIndex: i,
                    highlightDates: [{
                        "highlight-dates": [...customClasses.offtime]
                    }],
                    modal: true,
                    showNote: offtimes[i].note ? true : false,
                    notePreview: offtimes[i].note && offtimes[i].note.length ? offtimes[i].note : '',
                    disableRadioBtn: moment(offtimes[i].from).format('YYYY-MM-DD') !== moment(offtimes[i].to).format('YYYY-MM-DD'),
                    radioBtn: 'no'
                });
                break;
            }
        }
    }

    datePicked(date) {
        this.resetRepeat();
        let days = {...this.state.radioDays};
        let dayString = moment(date).format('dd');
        days[dayString] = true;
        this.setState({showWarning: false, radioDays: {...days}});
        const {customCSSclasses, allDates} = this.state;
        const {offtimes} = this.props;
        if (customCSSclasses.offtime.includes(date.format('YYYY-MM-DD'))) {
            const dat = date.format('YYYY-MM-DD');
            this.setEditOfftime(offtimes, customCSSclasses, allDates, dat);
        } else {
            const str = this.props.selectedStaffTimetable[moment(date).day()];
            let start;
            let end;
            if (str !== 'no') {
                start = moment(str.substring(0, str.indexOf('-')), 'hh:mm A');
                end = moment(str.substring(str.indexOf('-') + 1, str.length), 'hh:mm A');
                this.setState({
                    selectedDay: date,
                    startDate: start,
                    endDate: end,
                    modal: true,
                    editMode: false,
                    note: '',
                    noteLength: 0,
                    showNote: false,
                    notePreview: '',
                    radioBtn: 'no',
                    disableRadioBtn: false,
                });
            } else {
                this.setState({hoverTarget: `t${date.format('x')}`, popoverOpen: true});
            }
        }
    }

    rangePicked(start, end) {
        this.setState({
            selectedRange: [start, end],
            selectedDay: start
        });
    }

    toggleShowDaysOfWeek() {
        this.setState(prevState => ({
            showDaysOfWeek: !prevState.showDaysOfWeek
        }));
    }

    toggleForceFullWeeks() {
        this.setState(prevState => ({
            showDaysOfWeek: true,
            forceFullWeeks: !prevState.forceFullWeeks
        }));
    }

    toggleShowTodayBtn() {
        this.setState(prevState => ({
            showTodayBtn: !prevState.showTodayBtn
        }));
    }

    toggleShowWeekSeparators() {
        this.setState(prevState => ({
            showWeekSeparators: !prevState.showWeekSeparators
        }));
    }

    toggleSelectRange() {
        this.setState(prevState => ({
            selectRange: !prevState.selectRange
        }));
    }

    selectFirstDayOfWeek(event) {
        this.setState({
            firstDayOfWeek: parseInt(event.target.value, 10)
        });
    }

    updateClasses() {
        const {customCSSclasses} = this.state;
        // const input = this.customClassesInput.value;
        const context = {customCSSclasses, moment};

        try {
            // safeEval(input, context);

            const nextCustomCSSclasses = context.customCSSclasses;
            this.setState({
                customCSSclasses: nextCustomCSSclasses,
                customClassesError: false
            });
        } catch (e) {
            this.setState({
                customClassesError: true
            });
            throw e;
        }
    }

    render() {
        const {
            sortedOfftime,
            editMode,
            year,
            startDate,
            endDate,
            showTodayBtn,
            selectedDay,
            predefinedLabel,
            radioBtn,
            disableRadioBtn,
            showBtn,
            popoverOpen,
            hoverTarget,
            modal,
            deleteModal,
            note,
            noteLength,
            showNote,
            showWarning,
            notePreview,
            moreOpen,
            deleteOpen,
            showDaysOfWeek,
            forceFullWeeks,
            showWeekSeparators,
            firstDayOfWeek,
            selectRange,
            selectedRange,
            customCSSclasses,
            //repeat
            radioDays,
            firstWeek,
            repeat,
            repeatNumber,
            repeatType,
            repeatOn,
            repeatEndTime
        } = this.state;
        return (
            <div className='Offtime'>
                <DeleteModal
                    deleteModal={deleteModal}
                    toggle={this.toggleDeleteModal}
                    deleteOffTime={this.deleteModal}
                />
                {hoverTarget &&
                <Popover placement="bottom" isOpen={popoverOpen} target={hoverTarget} toggle={this.togglePopUp}>
                    <PopoverBody><Alert style={{margin: 0}} color="info">
                        Selected day is non working day for this staff.
                    </Alert></PopoverBody>
                </Popover>}
                {!deleteModal && <OffTimeModal
                    startDate={startDate}
                    endDate={endDate}
                    offtimeDates={customCSSclasses.offtime}
                    predefinedLabel={predefinedLabel}
                    predefinedRange={this.predefinedRange}
                    handleChangeStart={this.handleChangeStart}
                    handleChangeEnd={this.handleChangeEnd}
                    saveModal={this.saveModal}
                    toggleModal={this.toggleModal}
                    deleteModal={this.toggleDeleteModal}
                    modal={modal}
                    editMode={editMode}
                    highlight={customCSSclasses.offtime}
                    radioBtn={radioBtn}
                    disabled={disableRadioBtn}
                    onRadioChange={this.onRadioChange}
                    note={note}
                    noteLength={noteLength}
                    onChangeNote={this.onChangeNote}
                    addNote={this.addNote}
                    showNote={showNote}
                    showWarning={showWarning}
                    notePreview={notePreview}
                    //repeat
                    radioDays={radioDays}
                    repeat={repeat}
                    repeatNumber={repeatNumber}
                    repeatType={repeatType}
                    firstWeek={firstWeek}
                    repeatOn={repeatOn}
                    repeatEndTime={repeatEndTime}
                    toggleRadioDays={this.toggleRadioDays}
                    toggleFirstWeek={this.toggleFirstWeek}
                    toggleRepeat={this.toggleRepeat}
                    toggleRepeatNumber={this.toggleRepeatNumber}
                    toggleRepeatType={this.toggleRepeatType}
                    toggleRepeatOn={this.toggleRepeatOn}
                    handleChangeEndTime={this.handleChangeEndTime}

                />}
                <div id='calendar'>
                    <CalendarControls
                        year={year}
                        showTodayButton={showTodayBtn}
                        onPrevYear={() => this.onPrevYear()}
                        onNextYear={() => this.onNextYear()}
                        goToToday={() => this.goToToday()}
                    />
                    {this.props.offtime.pending && <div className='calendar-offtime--spinner'>
                        <div style={{position: 'absolute', left: '50%', top: '50%'}}>
                            <Spinner name="ball-spin-fade-loader" fadeIn='none'/>
                        </div>
                    </div>}
                    <Dropdown direction="right" isOpen={deleteOpen} toggle={this.toggleDelete}>
                        <DropdownToggle caret
                                        style={{
                                            borderRadius: 0,
                                            backgroundColor: '#dc3545',
                                            borderColor: '#dc3545'
                                        }}>
                            Delete..
                        </DropdownToggle>
                        <DropdownMenu>
                            <DropdownItem onClick={() => {
                                this.setState({
                                    deleteType: 'past'
                                }), this.toggleDeleteModal()
                            }}>Delete Past</DropdownItem>
                            <DropdownItem onClick={() => {
                                this.setState({
                                    deleteType: 'future'
                                }), this.toggleDeleteModal()
                            }}>Delete Future</DropdownItem>
                            <DropdownItem onClick={() => {
                                this.setState({
                                    deleteType: 'all'
                                }), this.toggleDeleteModal()
                            }}>Delete All</DropdownItem>


                        </DropdownMenu>
                    </Dropdown>
                    <Calendar
                        year={year}
                        selectedDay={selectedDay}
                        showDaysOfWeek={showDaysOfWeek}
                        forceFullWeeks={forceFullWeeks}
                        showWeekSeparators={showWeekSeparators}
                        firstDayOfWeek={firstDayOfWeek}
                        selectRange={selectRange}
                        selectedRange={selectedRange}
                        onPickDate={(date, classes) => this.datePicked(date, classes)}
                        onPickRange={(start, end) => this.rangePicked(start, end)}
                        customClasses={customCSSclasses}
                        onDayHover={this.onDayHover}
                        onDayMouseLeave={this.onDayMouseLeave}
                    />
                </div>
                <div className='offtime--transcript '>
                    <Table hover bordered>
                        <thead>
                        <tr className='offtime--transcript--header'>
                            <th>#</th>
                            <th onClick={() => this.sortOfftime('name')} style={{cursor: 'pointer'}}>Staff</th>
                            <th onClick={() => this.sortOfftime('start')} style={{cursor: 'pointer'}}>Start</th>
                            <th onClick={() => this.sortOfftime('end')} style={{cursor: 'pointer'}}>End</th>
                            <th nowrap="true">Total Time</th>
                            <th>Note</th>
                            <th>
                                <ButtonDropdown isOpen={moreOpen} toggle={this.toggleMore}>
                                    <DropdownToggle caret size='sm' style={{backgroundColor: '#666', border: '0'}}>
                                        More
                                    </DropdownToggle>
                                    <DropdownMenu right>
                                        <DropdownItem disabled><b>Sort by:</b></DropdownItem>
                                        <DropdownItem divider/>
                                        <DropdownItem onClick={() => this.sortOfftime('name')}
                                                      style={{cursor: 'pointer'}}>
                                            <small style={{paddingLeft: '0.5em'}}>Name</small>
                                        </DropdownItem>
                                        <DropdownItem onClick={() => this.sortOfftime('start')}
                                                      style={{cursor: 'pointer'}}>
                                            <small style={{paddingLeft: '0.5em'}}>Start Date</small>
                                        </DropdownItem>
                                        <DropdownItem onClick={() => this.sortOfftime('end')}
                                                      style={{cursor: 'pointer'}}>
                                            <small style={{paddingLeft: '0.5em'}}>End Date</small>
                                        </DropdownItem>
                                        <DropdownItem divider/>
                                        <DropdownItem disabled><b>Show:</b></DropdownItem>
                                        <DropdownItem divider/>
                                        <DropdownItem
                                            onClick={() => this.props.getUserOffDays(this.props.selectedStaff.company_id, this.props.selectedStaff.id, `${moment().format('YYYY-MM-DD hh:mm A')}`, `${moment().format('YYYY')}-12-31 11:59 PM`)}>
                                            <small style={{paddingLeft: '0.5em'}}>Show Staff</small>
                                        </DropdownItem>
                                        <DropdownItem
                                            onClick={() => this.props.getTeamOffDays(this.props.selectedStaff.company_id, this.props.selectedStaff.id, `${moment().format('YYYY-MM-DD hh:mm A')}`, `${moment().format('YYYY')}-12-31 11:59 PM`)}>
                                            <small style={{paddingLeft: '0.5em'}}>Show Team</small>
                                        </DropdownItem>
                                        <DropdownItem
                                            onClick={() => this.props.getCompanyOffDays(this.props.selectedStaff.company_id, `${moment().format('YYYY-MM-DD hh:mm A')}`, `${moment().format('YYYY')}-12-31 11:59 PM`)}>
                                            <small style={{paddingLeft: '0.5em'}}>Show All</small>
                                        </DropdownItem>
                                    </DropdownMenu>
                                </ButtonDropdown>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {sortedOfftime && sortedOfftime.map((offtime, index) => {
                            return (
                                <tr key={index + 1} className='offtime--transcript--row'>
                                    <td>{index + 1}</td>
                                    <td nowrap="true">{offtime.user ? offtime.user.name : 'no name'}</td>
                                    <td nowrap="true">
                                        <span>{moment(offtime.from).format('MM/DD/YYYY')} {moment(offtime.from).format('hh:mm A')}</span>
                                    </td>
                                    <td nowrap="true">
                                        <span>{moment(offtime.to).format('MM/DD/YYYY')} {moment(offtime.to).format('hh:mm A')}</span>
                                    </td>
                                    <td>
                                        <span>{moment.duration(moment(offtime.to, 'YYYY-MM-DD hh:mm A').diff(offtime.from)).asHours() > 23 ?
                                            Math.floor(moment.duration(moment(offtime.to, 'YYYY-MM-DD hh:mm A').diff(offtime.from)).asDays()) + ' days' : ''} </span>
                                        <span>{moment.duration(moment(offtime.to, 'YYYY-MM-DD hh:mm A').diff(offtime.from)).asHours() % 24} hours</span>
                                    </td>
                                    <td>{offtime.note ? offtime.note : ''}</td>
                                    <td nowrap="true">
                                        <Button onClick={() => this.datePicked(moment(offtime.from))} outline
                                                color='info' size='sm'
                                                style={{marginRight: '1em', padding: '.25em 1em'}}>
                                            Edit
                                        </Button>{' '}
                                        <Button
                                            size='sm'
                                            id='delete-button'
                                            onClick={() => {
                                                this.setState({
                                                    offtimeCompanyID: offtime.company_id,
                                                    offtimeID: offtime.id,
                                                    deleteType: 'single'
                                                }), this.toggleDeleteModal()
                                            }}
                                            color="danger">
                                            <Icon icon={faTrashAlt}/>
                                        </Button>
                                    </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </Table>
                </div>
            </div>
        )
    }
}

export default OffTime;
