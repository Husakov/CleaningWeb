import React, { Component, Fragment } from 'react';
import {
    Badge,
    Button,
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
    faCheck,
    faFilePdf,
    faPencilAlt,
    faSearch,
    faTrash,
    faWindowClose
} from "@fortawesome/fontawesome-free-solid/shakable.es";
import Table from 'react-table'
import 'react-table/react-table.css'
import CreateQuoteDialog from '../../containers/Quotes/CreateQuoteDialog';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { getList } from '../../reducers/serviceReducer';
import { deleteErrors, deleteQuote, editQuote, getQuotes } from '../../reducers/quotesReducer';
import QuoteModel from '../../model/quote';
import { debounce } from "../../util";
import { quotes as quotesapi } from '../../api';
import { Link } from "react-router-dom";
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

const statuses = ['All', 'Scheduled', 'Accepted', 'Declined', 'Sent', 'Unsent', 'Viewed', 'Paid', 'Expired'];
const selectFilter = ({ filter, onChange }) => (
    <Fragment>
        <Input className="filter-search-select" type="select" style={{ height: 34, paddingLeft: 28 }}
               value={filter ? filter.value : ''}
               onChange={e => onChange(e.target.value)}>
            {statuses.map((status, i) => {
                return (<option key={i} value={status === "All" ? "" : status}>{status}</option>)
            })}
        </Input>
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

const getBadgeFromStatus = (status, date) => {
    status = new Date(new Date(date).getTime() + +24 * 60 * 60 * 1000) < new Date() && status !== "Accepted" && status !== "Paid" ? "Expired" : status;
    if (status === "Expired")
        return "dark";
    else if (status === "Accepted")
        return "info";
    else if (status === "Paid")
        return "success";
    else if (status === "Unpaid")
        return "warning";
    else if (status === "Viewed")
        return "primary";
    else if (status === "Sent")
        return "light";
    else if (status === "Unsent")
        return "secondary";
    else if (status === "Declined")
        return "danger";
    return "danger";
};

class Quotes extends Component {
    data = [{}];
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
            ...header("Quote Title", "title"),
        },
        {
            ...header("Customer", "name", nameFilter),
            Cell: ({ original }) => <Link
                to={`/dashboard/customer/${original.customer_id}`}>{`${original.first_name} ${original.last_name}`}</Link>
        },
        {
            ...header("Expiration Date", "expiration", dateFilter),
            Cell: ({ original }) => (moment(original.expiration).format("MM/DD/YYYY"))
        },

        {
            Header: "Net Total",
            accessor: "total",
            Filter: rangeFilter,
            Cell: data => [
                <div key={0} className="rt-td">{data.original.total / 100}</div>
            ]
        },
        {
            ...header("Status", "status", selectFilter),
            Cell: data => [
                <Badge
                    color={getBadgeFromStatus(data.original.status, data.original.expiration)}
                    key={0}>
                    {(new Date(new Date(data.original.expiration).getTime() + +24 * 60 * 60 * 1000) < new Date()) && data.original.status !== "Accepted" && data.original.status !== "Paid" ? "Expired" : data.original.status}
                </Badge>
            ]
        },
        {
            ...header("Actions"),
            Cell: data => [
                <div key={1} className="mr-2">
                    <Button color="danger"
                            onClick={() => this.setState({
                                popOvers: {
                                    ...this.state.popOvers,
                                    [data.original.quote_id]: true
                                }
                            })}
                            disabled={this.props.deleting}
                            id={`deletePopover_${data.original.quote_id}`}><Icon
                        icon={faTrash} /></Button></div>,
                <div key={2}>
                    <Popover
                        placement="left"
                        target={`deletePopover_${data.original.quote_id}`}
                        isOpen={this.state.popOvers[data.original.quote_id]}
                        toggle={() => this.setState({
                            popOvers: {
                                ...this.state.popOvers,
                                [data.original.quote_id]: false
                            }
                        })}>
                        <PopoverHeader>Delete this Quote?</PopoverHeader>
                        <PopoverBody className="d-flex justify-content-between">
                            <Button color="danger"
                                    onClick={() => this.deleteQuote(data.original.quote_id)}>
                                Yes
                            </Button>
                            <Button color="secondary"
                                    onClick={() => this.setState({
                                        popOvers: {
                                            ...this.state.popOvers,
                                            [data.original.quote_id]: false
                                        }
                                    })}>
                                Cancel
                            </Button>
                        </PopoverBody>
                    </Popover></div>,
                <Dropdown

                    key={3}
                    isOpen={this.state.dropdownsOpen[data.original.quote_id]}
                    toggle={() => this.setState({
                        dropdownsOpen: {
                            ...this.state.dropdownsOpen,
                            [data.original.quote_id]: !this.state.dropdownsOpen[data.original.quote_id]
                        }
                    })}>
                    <DropdownToggle
                        caret color="success">
                        Actions
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem
                            onClick={() => {
                                this.props.editQuote(this.props.user.selectedCompany.id, data.original.quote_id, { status: "Accepted" })
                            }}>
                            <Icon icon={faCheck} style={{ width: '20px' }} />{' '}Accept Quote
                        </DropdownItem>
                        <DropdownItem
                            onClick={() => {
                                this.props.editQuote(this.props.user.selectedCompany.id, data.original.quote_id, { status: "Declined" })
                            }}>
                            <Icon icon={faWindowClose} style={{ width: '20px' }} />{' '}Decline Quote
                        </DropdownItem>
                        <DropdownItem
                            onClick={() => this.createQuoteToggle(data.original)}
                        ><Icon icon={faPencilAlt} style={{ width: '20px' }} />{' '}Edit Quote
                        </DropdownItem>
                        <DropdownItem
                            onClick={() => this.getPdf(data.original.url)}>
                            <Icon icon={faFilePdf} style={{ width: '20px' }} />{' '}View Quote
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            ],
            filterable: false,
            sortable: false
        }
    ];
    filter = [];


    deleteQuote(id) {
        this.props.deleteQuote(this.props.user.selectedCompany.id, id);
    }
    getPdf(url) {
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
    filterType = e => {
        if (e.target.value === '')
            this.setState({ typeFilter: null }, () => {
                if (this.tableState) {
                    this.fetchData(this.tableState)
                }
            });
        else
            this.setState({ typeFilter: e.target.value }, () => {
                if (this.tableState) {
                    this.fetchData(this.tableState)
                }
            });
    };
    fetchData = (state) => {
        setTimeout(() => {
            state.pageSize = this.state.pageSize;
            this.tableState = state;
            if (this.filterChanged(state.filtered)) {

                debounce(() => {
                    this.props.getQuotes(
                        this.props.user.selectedCompany.id,
                        state.page * state.pageSize,
                        state.pageSize,
                        state.sorted,
                        [...state.filtered, {id:"customer_id", value: this.props.customer.id}],
                        this.state.typeFilter === "" ? null : [...this.props.typeFilter, {id:"customer_id", value:this.props.customer.id}])
                }, 500);
            } else {

                this.props.getQuotes(
                    this.props.user.selectedCompany.id,
                    state.page * state.pageSize,
                    state.pageSize,
                    state.sorted,
                    [...state.filtered, {id:"customer_id", value: this.props.customer.id}],
                    this.state.typeFilter === "" ? null : [...this.state.typeFilter, {id:"customer_id", value:this.props.customer.id}])
            }
        }, 100);

    };

    async createQuoteToggle(quote = new QuoteModel()) {
        if (quote.id !== -1) {
            const newQuote = await quotesapi.getQuote(this.props.user.selectedCompany.id, quote.quote_id);
            this.props.deleteErrors();
            this.setState({ isOpen: !this.state.isOpen, quote: newQuote });
        }
        else this.setState({ isOpen: !this.state.isOpen, quote });

    }

    deleteQuote(id) {
        this.props.deleteQuote(this.props.user.selectedCompany.id, id);
    }

    getPdf(url) {
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

    render() {
        return (
            <Container fluid>
                <Row>
                    <Col md={12} className="px-0">
                        <Table
                            columns={this.headers}
                            data={this.props.data.quotes}
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
        )
    }
}

function mapState(state) {
    return {
        services: state.service.services,
        user: state.user,
        data: state.quotes.data,
        loading: state.quotes.request.pending
    }
}

function mapDispatch(dispatch) {
    return bindActionCreators({
        getServices: getList,
        getQuotes,
        deleteQuote,
        editQuote,
        deleteErrors
    }, dispatch)
}

export default connect(mapState, mapDispatch)(Quotes)
