import React, { Component, Fragment } from 'react';
import {
    Col,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Input,
    Popover,
    PopoverBody,
    PopoverHeader,
    Row, Container
} from 'reactstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import Icon from '@fortawesome/react-fontawesome';
import {

    faSearch,
} from "@fortawesome/fontawesome-free-solid/shakable.es";
import Table from 'react-table'
import 'react-table/react-table.css'
import CreateQuoteDialog from '../../containers/CreateCustomerDialog';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { getList } from '../../reducers/serviceReducer';
import {getAppointments, getUpcoming} from '../../reducers/customerAppointmentsReducer';
import QuoteModel from '../../model/quote';
import { debounce } from "../../util";

import '../../containers/Quotes/Quotes.css';



const header = (Header, accessor, filter = textFilter) => ({ Header, accessor, Filter: filter });


const textFilter = ({ filter, onChange }) => (
    <Fragment>
        <input type="text" value={filter ? filter.value : ''} onChange={e => onChange(e.target.value)} />
        <Icon className="filter-search" icon={faSearch} />
    </Fragment>
);

const rangeFilter = ({ filter, onChange }) => {
    const change = (idx, val) => {
        let newVal;
        if (!filter) {
            newVal = ["", ""];
        } else {
            newVal = filter.value;
        }
        newVal[idx] = val;
        onChange(newVal);
    };
    return (
        <Fragment>
            <div style={{ display: "flex" }}>
                <Input onChange={e => change(0, e.target.value)} className="filter-search-range"
                       value={filter ? filter.value[0] : ""}
                       placeholder="From" />
                <div className="filter-search-range-dividor" />
                <Input onChange={e => change(1, e.target.value)} className="filter-search-range"
                       value={filter ? filter.value[1] : ""}
                       placeholder="To" />
            </div>
        </Fragment>
    )
};

const nameFilter = ({ filter, onChange }) => {
    const nameChange = (value) => {
        onChange(value.split(" "));
    };
    return textFilter({
        filter: filter && filter.value instanceof Array ? {
            ...filter,
            value: filter.value.join(" ")
        } : filter, onChange: nameChange
    });
};


const selectFilter = ({ filter, onChange }) => (
    <Fragment>
        <input type="text" value={filter ? filter.value : ''} onChange={e => onChange(e.target.value)} />
        <Icon className="filter-search" icon={faSearch} />
    </Fragment>
);




class DateFilter extends React.Component {

    state = {
        isOpen: false
    };

    onChangeDate = (index, e) => {
        const { filter, onChange } = this.props;
        let newFilter;
        if (!filter) {
            newFilter = [moment(), moment()]
        } else {
            newFilter = filter.value;
        }
        newFilter[index] = e;
        onChange(newFilter);
    };

    togglePopover = () => {
        this.setState({ isOpen: !this.state.isOpen })
    };

    render() {
        let { filter } = this.props;
        if (filter) {
            filter = filter.value;
        }
        const { isOpen } = this.state;
        return (
            <Fragment>
                <Input type="text" id="range-picker"
                       value={filter ? `${filter[0].format("MM/DD/YY")} - ${filter[1].format("MM/DD/YY")}` : ""}
                       onFocus={() => this.togglePopover()} />
                <Icon className="filter-search" icon={faSearch} />
                <Popover isOpen={isOpen}
                         toggle={() => this.togglePopover()}
                         target="range-picker"
                         className="chart-popover"
                         placement="bottom">
                    <PopoverHeader>Select Date Range</PopoverHeader>
                    <PopoverBody className="d-flex">
                        <DatePicker inline
                                    selected={filter ? filter[0] : moment()}
                                    onChange={e => this.onChangeDate(0, e)} />
                        <DatePicker inline selectsEnd
                                    selected={filter ? filter[1] : moment()}
                                    startDate={filter ? filter[0] : moment()}
                                    endDate={filter ? filter[1] : moment()}
                                    onChange={e => this.onChangeDate(1, e)} />
                    </PopoverBody>
                </Popover>
            </Fragment>
        )
    }
}

const dateFilter = (props) => (
    <DateFilter {...props} />
);


class Appointments extends Component {
    data = [{}];
    dataUpcoming = [{}];
    state = {
        isOpen: false,
        quote: {},
        popOvers: {},
        dropdownsOpen: {},
        pageSize: 5,
        typeFilter: "",
        date: moment()
    };
    headers = [
        {
            ...header("Date", "title"),
            Cell: data => [
                <div className="rt-td">{moment(data.original.start_time).format("MM/DD/YYYY")}</div>
            ]
        },
        {
            ...header("Services", "name", nameFilter),
            Cell: data =>[
                <div className="rt-td">{data.original.appointment_services[0] ? data.original.appointment_services[0].service.name : ""}</div>
            ]
        },
        {
            ...header("Add-ons", "expiration", dateFilter),
            Cell: data=>[
                <div className="rt-td">{data.original.appointment_services[1]}</div>
            ]
        },

        {
            Header: "Price",
            accessor: "total",
            Filter: rangeFilter,
            Cell: data => [
                <div key={0} className="rt-td">{data.original.total/100}$</div>
            ]
        },
        {
            Header: "Staff",
            Filter: nameFilter,
                Cell: data=>[
        <div key={0} className="rt-td">{data.original.team ? data.original.team.name : " "}</div>
            ]
        },
        {
            ...header("Actions"),
            Cell: data => [

                <Dropdown

                    key={3}
                    isOpen={this.state.dropdownsOpen[data.original.appointment_services[0] ? data.original.appointment_services[0].id : 5000]}
                    toggle={() => this.setState({
                        dropdownsOpen: {
                            ...this.state.dropdownsOpen,
                            [data.original.appointment_services[0] ? data.original.appointment_services[0].id : 5000]: !this.state.dropdownsOpen[data.original.appointment_services[0] ? data.original.appointment_services[0].id : 5000]
                        }
                    })}>
                    <DropdownToggle
                        caret color="success">
                        Actions
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem
                            onClick={() => this.viewInvoice(data.original.invoice ? data.original.invoice.url : "")}>
                            <Icon style={{ width: '20px' }} />{' '}View Invoice
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            ],
            filterable: false,
            sortable: false
        }
    ];




    filter = [];
    viewInvoice = (url) => {
        const win = window.open(url, '_blank');
        win.focus();

    }



    calculatePageNumber() {
        if (this.props.data.total === -1)
            return 0;
        else {
            return Math.ceil(this.props.data.total / this.state.pageSize)
        }
    }

    filterChanged(filtered) {
        if (filtered.length !== this.filter.length) {
            this.filter = filtered;
            return true
        }
        let filterChanged = false;
        filtered.forEach((item, i) => {
            if (item.value !== this.filter[i].value) {
                filterChanged = true;
            }
        });
        this.filter = filtered;
        return filterChanged;
    }

    fetchData = (state) => {
        setTimeout(() => {
            state.pageSize = this.state.pageSize;
            this.tableState = state;
            if (this.filterChanged(state.filtered)) {

                debounce(() => {
                    this.props.getAppointments(
                        this.props.user.selectedCompany.id,
                        state.page * state.pageSize,
                        state.pageSize,
                        state.sorted,
                        [...state.filtered, {id:"customer_id", value: this.props.customer.id}],
                        this.state.typeFilter === "" ? null : [...this.props.typeFilter, {id:"customer_id", value:this.props.customer.id}])
                }, 500);
            } else {

                this.props.getAppointments(
                    this.props.user.selectedCompany.id,
                    state.page * state.pageSize,
                    state.pageSize,
                    state.sorted,
                    [...state.filtered, {id:"customer_id", value: this.props.customer.id}],
                    this.state.typeFilter === "" ? null : [...this.state.typeFilter, {id:"customer_id", value:this.props.customer.id}])
            }
        }, 100);

    };

fetchUpcomingData = (state) => {
        setTimeout(() => {
            state.pageSize = this.state.pageSize;
            this.tableState = state;
            if (this.filterChanged(state.filtered)) {

                debounce(() => {
                    this.props.getUpcoming(
                        this.props.user.selectedCompany.id,
                        state.page * state.pageSize,
                        state.pageSize,
                        state.sorted,
                        [...state.filtered, {id:"customer_id", value: this.props.customer.id}],
                        this.state.typeFilter === "" ? null : [...this.props.typeFilter, {id:"customer_id", value:this.props.customer.id}])
                }, 500);
            } else {

                this.props.getUpcoming(
                    this.props.user.selectedCompany.id,
                    state.page * state.pageSize,
                    state.pageSize,
                    state.sorted,
                    [...state.filtered, {id:"customer_id", value: this.props.customer.id}],
                    this.state.typeFilter === "" ? null : [...this.state.typeFilter, {id:"customer_id", value:this.props.customer.id}])
            }
        }, 100);

    };




    calculatePageNumber() {
        if (this.props.data.total === -1)
            return 0;
        else {
            return Math.ceil(this.props.data.total / this.state.pageSize)
        }
    }

    filterChanged(filtered) {
        if (filtered.length !== this.filter.length) {
            this.filter = filtered;
            return true
        }
        let filterChanged = false;
        filtered.forEach((item, i) => {
            if (item.value !== this.filter[i].value) {
                filterChanged = true;
            }
        });
        this.filter = filtered;
        return filterChanged;
    }

    render() {

        return (<div>
            <Container fluid>
                <Row>
                    <Col md={12} className="px-0">
                        <Table
                            columns={this.headers}
                            data={this.props.data}
                            pages={this.calculatePageNumber()}
                            loading={this.props.loading}
                            loadingText='Loading...'
                            manual filterable
                            onFetchData={this.fetchData}
                            className="customer-table -striped"
                            pageSize={this.state.pageSize}
                            onPageSizeChange={(size) => this.setState({ pageSize: size })}
                        />
                    </Col>
                    <CreateQuoteDialog
                        quote={this.state.quote}
                        isOpen={this.state.isOpen}
                        toggle={() => this.createQuoteToggle(new QuoteModel())}
                        services={this.props.services} />
                </Row>
            </Container>
                <h5 >Past Appointments</h5>
                <Container fluid>
                    <Row>
                        <Col md={12} className="px-0">
                            <Table
                                columns={this.headers}
                                data={this.props.dataUpcoming}
                                pages={this.calculatePageNumber()}
                                loading={this.props.loading}
                                loadingText='Loading...'
                                manual filterable
                                onFetchData={this.fetchUpcomingData}
                                className="customer-table -striped"
                                pageSize={this.state.pageSize}
                                onPageSizeChange={(size) => this.setState({ pageSize: size })}
                            />
                        </Col>
                        <CreateQuoteDialog
                            quote={this.state.quote}
                            isOpen={this.state.isOpen}
                            toggle={() => this.createQuoteToggle(new QuoteModel())}
                            services={this.props.services} />
                    </Row>
                </Container>
            </div>
        )
    }
}

function mapState(state) {
    return {
        services: state.service.services,
        user: state.user,
        dataUpcoming: state.userdetails.data,
        data: state.userdetails.dataUpcoming,
        loading: state.quotes.request.pending
    }
}

function mapDispatch(dispatch) {
    return bindActionCreators({

        getUpcoming,
        getList,
        getAppointments
    }, dispatch)
}

export default connect(mapState, mapDispatch)(Appointments)
