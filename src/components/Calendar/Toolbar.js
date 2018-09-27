import React from 'react';
import {faAngleDoubleLeft, faAngleDoubleRight} from "@fortawesome/fontawesome-free-solid/shakable.es";
import moment from "moment/moment";
import Icon from '@fortawesome/react-fontawesome';
import DatePicker from "react-datepicker";
import {faChevronLeft, faChevronRight} from "@fortawesome/fontawesome-free-solid/index.es";
import Select from "@kemoke/react-select";

class Toolbar extends React.Component {

    state = {
        showDatePicker: false
    };

    goToDayView = () => {
        const {toolbar, start, companyID} = this.props;
        Object.values(toolbar).forEach(toolbar => toolbar.onViewChange('day'));
        this.props.loadEvents(companyID, moment(start).startOf("day").toISOString(), moment(start).endOf("day").toISOString());
        this.props.viewChange('day');
    };

    goToWeekView = () => {
        const {toolbar, start, companyID} = this.props;
        Object.values(toolbar).forEach(toolbar => toolbar.onViewChange('week'));
        this.props.loadEvents(companyID, moment(start).startOf("week").toISOString(), moment(start).endOf("week").toISOString());
        this.props.viewChange('week');
    };

    goToMonthView = () => {
        const {toolbar, start, companyID} = this.props;
        Object.values(toolbar).forEach(toolbar => toolbar.onViewChange('month'));
        this.props.loadEvents(companyID, moment(start).startOf("month").toISOString(), moment(start).endOf("month").toISOString());
        this.props.viewChange('month');
    };

    goToAgendaView = () => {
        const {toolbar, start, companyID} = this.props;
        Object.values(toolbar).forEach(toolbar => toolbar.onViewChange('agenda'));
        this.props.loadEvents(companyID, moment(start).startOf("month").toISOString(), moment(start).endOf("month").toISOString());
        this.props.viewChange('agenda');
    };

    goToBack = () => {
        const {toolbar} = this.props;
        Object.values(toolbar).forEach(toolbar => toolbar.onNavigate('PREV'));
    };

    goToNext = () => {
        const {toolbar} = this.props;
        Object.values(toolbar).forEach(toolbar => toolbar.onNavigate('NEXT'));
    };

    goToCurrent = () => {
        const {toolbar} = this.props;
        Object.values(toolbar).forEach(toolbar => toolbar.onNavigate('TODAY'));
    };

    clickOutside = () => {
        this.setState({
            showDatePicker: !this.state.showDatePicker
        })
    };

    renderOption = option => (
        <div>
            <input type="checkbox" className="mr-2" readOnly
                   checked={this.props.selected.indexOf(option.value) !== -1}/>
            {option.label}
        </div>
    );

    renderStaffOption = option => (
        <div>
            <input type="checkbox" className="mr-2" readOnly
                   checked={this.props.selectedStaff.indexOf(option.value) !== -1}/>
            {option.label}
        </div>
    );

    render() {
        if (!this.props.toolbar || !this.props.start) return null;
        return (
            <div className='toolbar'>
                <div className="d-flex align-items-center">
                    <span className="cursor-pointer toolbar-items"
                          title={this.props.sidebarOpen ? "Close sidebar" : "Open sidebar"}
                          onClick={this.props.sidebarToggle}>
                        <Icon icon={this.props.sidebarOpen ? faChevronLeft : faChevronRight}/>
                    </span>
                    <div className="d-inline-block position-relative ml-5">
                        <div className="select-hint">Select Teams</div>
                        <Select multi
                                placeholder=""
                                optionRenderer={this.renderOption}
                                removeSelected={false}
                                className="d-inline-block"
                                style={{width: 200, height: 30}}
                                options={[
                                    {label: "Select All", value: "all"},
                                    ...this.props.teams.map(t => ({label: t.name, value: t.id}))
                                ]}
                                value={this.props.selected}
                                onChange={this.props.selectedTeamsChanged}/>
                    </div>
                    <div className="d-inline-block position-relative ml-1 mr-5">
                        <div className="select-hint">Select Staff</div>
                        <Select multi
                                placeholder=""
                                optionRenderer={this.renderStaffOption}
                                removeSelected={false}
                                className="d-inline-block"
                                style={{width: 200, height: 30}}
                                options={[
                                    {label: "Select All", value: "all"},
                                    ...this.props.staff.map(s => ({label: s.name, value: s.id}))
                                ]}
                                value={this.props.selectedStaff}
                                onChange={this.props.selectedStaffChanged}/>
                    </div>
                    <span className='cursor-pointer toolbar-items' onClick={() => this.goToBack()}>
                        <Icon icon={faAngleDoubleLeft}/>
                    </span>
                    <span className='cursor-pointer toolbar-items' onClick={() => this.goToNext()}>
                        <Icon icon={faAngleDoubleRight}/>
                    </span>
                    <span className='cursor-pointer toolbar-items' onClick={() => this.goToCurrent()}>Today</span>
                </div>
                <span className='cursor-pointer toolbar-items'>
                    <span onClick={() => this.setState({showDatePicker: !this.state.showDatePicker})}>
                        <b>{this.props.start.format('MMMM')}</b>
                        <span> {this.props.start.format('DD YYYY')}</span>
                    </span>
                    {this.state.showDatePicker && <DatePicker
                        selected={this.props.start}
                        onChange={this.props.handleChange}
                        onClickOutside={this.clickOutside}
                        inline
                        className='date-picker__fixed'
                        calendarClassName="date-picker__fixed"
                        popperPlacement="top-end"
                        minDate={moment().subtract(6, "month")}
                        maxDate={moment().add(6, "month")}
                        showMonthYearDropdown/>}
                    </span>
                <div>
                    <span className='cursor-pointer toolbar-items' onClick={() => this.goToMonthView()}> Month</span>
                    <span className='cursor-pointer toolbar-items' onClick={() => this.goToWeekView()}> Week</span>
                    <span className='cursor-pointer toolbar-items' onClick={() => this.goToDayView()}> Day</span>
                    <span className='cursor-pointer toolbar-items' onClick={() => this.goToAgendaView()}> Agenda</span>
                </div>
            </div>
        )
    }
}

export default Toolbar;
