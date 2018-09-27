import React, { Fragment } from 'react';
import { faSearch } from "@fortawesome/fontawesome-free-solid/shakable.es";
import Table from 'react-table';

import {
    Badge,
    Button,
    Col,
    Container,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Input,
    Popover,
    PopoverBody,
    PopoverHeader,
    Row
} from "reactstrap";
import { Link } from "react-router-dom";
import Icon from '@fortawesome/react-fontawesome';
import { appointment, invoices } from "../../api";
import moment from "moment";
import { connect } from 'react-redux';
import DatePicker from "react-datepicker";
import PaymentDialog from "./PaymentDialog";

import { debounce } from "../../util";
import RequestPaymentDialog from "./RequestPaymentDialog";
import BookingDialog from "../Calendar/BookingDialog";
import { faTrash } from "@fortawesome/fontawesome-free-solid/index.es";

const header = (Header, accessor, filter = textFilter) => ({ Header, accessor, Filter: filter });

const textFilter = ({ filter, onChange }) => (
    <Fragment>
        <input type="text" value={filter ? filter.value : ''} onChange={e => onChange(e.target.value)} />
        <Icon className="filter-search" icon={faSearch} />
    </Fragment>
);

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

const selectFilter = ({ filter, onChange }) => (
    <Fragment>
        <Input className="filter-search-select" type="select" style={{ height: 34, paddingLeft: 28 }}
            value={filter ? filter.value : ''}
            onChange={e => onChange(e.target.value)}>
            <option value="" />
            <option value="Partially Paid">Partially Paid</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
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

class InvoiceList extends React.Component {
    toggleDropdown = id => {
        const { dropdowns } = this.state;
        dropdowns[id] = !dropdowns[id];
        this.setState({ dropdowns })
    };
    loadAppointment = async id => {
        const selectedAppointment = await appointment(this.props.user.selectedCompany.id).get(id);
        this.setState({ selectedAppointment }, this.toggleBooking);
    };
    state = {
        pageSize: 20,
        data: {
            total: 0,
            invoices: []
        },
        dropdowns: {},
        loading: false,
        selectedInvoice: {},
        selectedAppointment: {},
        paymentOpen: false,
        requestPaymentOpen: false,
        bookingOpen: false,
        viewOpen: false,
        tempFrameUrl: "",
        popOvers: {}
    };
    fetchData = (state) => {
        const companyID = this.props.user.selectedCompany.id;
        setTimeout(async () => {
            if (this.filterChanged(state.filtered)) {
                debounce(async () => {
                    this.setState({ loading: true });
                    try {
                        const data = await invoices.get(
                            companyID,
                            state.page * state.pageSize,
                            state.pageSize,
                            state.sorted,
                            state.filtered,
                        );
                        this.setState({ data });
                    } catch (e) {
                        console.error(e);
                    } finally {
                        this.setState({ loading: false });
                    }
                }, 500)
            } else {
                this.setState({ loading: true });
                try {
                    const data = await invoices.get(
                        companyID,
                        state.page * state.pageSize,
                        state.pageSize,
                        state.sorted,
                        state.filtered,
                    );
                    this.setState({ data });
                } catch (e) {
                    console.error(e);
                } finally {
                    this.setState({ loading: false });
                }
            }
        }, 100);
    };
    deleteInvoice = async (id) => {
        await invoices.delete(this.props.user.selectedCompany.id, id);
        const inv = [...this.state.data.invoices];
        const index = inv.findIndex(invoice => invoice.id === id);
        inv.splice(index, 1);
        this.setState({ data: { ...this.state.data, invoices: inv } });
    }
    togglePayment = () => {
        this.setState({ paymentOpen: !this.state.paymentOpen })
    };
    toggleRequestPayment = () => {
        this.setState({ requestPaymentOpen: !this.state.requestPaymentOpen })
    };
    toggleBooking = () => {
        this.setState({ bookingOpen: !this.state.bookingOpen })
    };
    closeBooking = () => {
        this.setState({ bookingOpen: false });
    };
    toggleView = (url) => {
        window.open(url, "_blank").focus();
    };
    headers = [
        header("Invoice #", "id"),
        {
            ...header("Customer", "name", nameFilter),
            Cell: ({ original }) => <Link
                to={`/dashboard/customer/${original.customer.id}`}>{`${original.customer.first_name} ${original.customer.last_name}`}</Link>
        },
        {
            ...header("Status", "status", selectFilter),
            Cell: ({ original }) => <Badge
                color={original.status === "paid" ? "success" : "warning"}>{original.status ? original.status : "Unpaid"}</Badge>
        },
        {
            ...header("Date", "created_at", dateFilter),
            Cell: ({ original }) => (moment(original.created_at).format("MM/DD/YYYY hh:mm A"))
        },
        {
            ...header("Amount", "amount", rangeFilter),
            Cell: ({ original }) => (`$${original.amount / 100}`)
        },
        {
            ...header("Actions"),
            Cell: data => (
                <Fragment>
                    <Button color="danger" id={`deletePopover_${data.original.id}`} className="mr-2"
                        onClick={() => this.setState({
                            popOvers: {
                                ...this.state.popOvers,
                                [data.original.id]: true
                            }
                        })}><Icon icon={faTrash} /></Button>
                    <Popover
                        placement="left"
                        target={`deletePopover_${data.original.id}`}
                        isOpen={this.state.popOvers[data.original.id]}
                        toggle={() => this.setState({
                            popOvers: {
                                ...this.state.popOvers,
                                [data.original.id]: false
                            }
                        })}>
                        <PopoverHeader>Delete this Invoice?</PopoverHeader>
                        <PopoverBody className="d-flex justify-content-between">
                            <Button color="danger"
                                onClick={() => this.deleteInvoice(data.original.id)}>
                                Yes
                            </Button>
                            <Button color="secondary"
                                onClick={() => this.setState({
                                    popOvers: {
                                        ...this.state.popOvers,
                                        [data.original.id]: false
                                    }
                                })}>
                                Cancel
                            </Button>
                        </PopoverBody>
                    </Popover>
                    <Dropdown isOpen={this.state.dropdowns[data.original.id]}
                        toggle={() => this.toggleDropdown(data.original.id)}>
                        <DropdownToggle color="success" caret>Actions</DropdownToggle>
                        <DropdownMenu>
                            <DropdownItem onClick={() => {
                                this.setState({ selectedInvoice: data.original }, this.togglePayment)
                            }}>Pay Now</DropdownItem>
                            <DropdownItem onClick={() => {
                                this.setState({ selectedInvoice: data.original }, this.toggleRequestPayment)
                            }}>Request Payment</DropdownItem>
                            <DropdownItem onClick={() => this.loadAppointment(data.original.appointment_id)}>Edit
                                Appointment</DropdownItem>
                            <DropdownItem onClick={() => this.toggleView(data.original.url)}>View Invoice</DropdownItem>
                            {/*<DropdownItem onClick={e => this.print(data.original.url)}>Print Invoice</DropdownItem>*/}
                        </DropdownMenu>
                    </Dropdown>
                </Fragment>
            ),
            filterable: false,
            sortable: false
        }
    ];
    tableState = undefined;
    filter = [];

    calculatePageNumber() {
        if (this.state.data.total === -1)
            return 0;
        else {
            return Math.ceil(this.state.data.total / this.state.pageSize)
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
                    <Col className="px-0">
                        <Table columns={this.headers}
                            loading={this.state.loading}
                            pages={this.calculatePageNumber()}
                            data={this.state.data.invoices}
                            onFetchData={this.fetchData}
                            className="customer-table -striped"
                            manual filterable />
                        <PaymentDialog isOpen={this.state.paymentOpen}
                            invoice={this.state.selectedInvoice}
                            toggle={this.togglePayment} />
                        <RequestPaymentDialog isOpen={this.state.requestPaymentOpen}
                            invoice={this.state.selectedInvoice} toggle={this.toggleRequestPayment} />
                        <BookingDialog isOpen={this.state.bookingOpen}
                            appointment={this.state.selectedAppointment}
                            toggleModal={this.toggleBooking}
                            closeModal={this.closeBooking}
                            start_time={this.state.selectedAppointment.start}
                            end_time={this.state.selectedAppointment.end} />
                    </Col>
                </Row>
            </Container>
        )
    }
}

function mapState(state) {
    return {
        user: state.user
    }
}

export default connect(mapState)(InvoiceList);
