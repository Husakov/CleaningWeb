import React, {Fragment} from 'react'
import Table from 'react-table'
import {Button, Col, Container, Input, Popover, PopoverBody, PopoverHeader, Row} from "reactstrap";
import Icon from '@fortawesome/react-fontawesome'
import {faSearch, faSync, faTrash} from "@fortawesome/fontawesome-free-solid/shakable.es";
import CreateCustomerDialog from "./CreateCustomerDialog";
import './customers.css'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {deleteCustomer, getCustomers} from "../reducers/customerReducer";
import {debounce, formatNumber} from "../util";
import {Link} from "react-router-dom";
import {company, customer} from "../api";
import moment from "moment";
import ImportCustomersDialog from "../components/customers/ImportCustomersDialog";

const header = (Header, accessor, Filter = textFilter) => ({Header, accessor, Filter});

const textFilter = ({filter, onChange}) => (
    <Fragment>
        <input type="text" value={filter ? filter.value : ''} onChange={e => onChange(e.target.value)}/>
        <Icon className="filter-search" icon={faSearch}/>
    </Fragment>
);

const nameFilter = ({filter, onChange}) => {
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

class Customers extends React.Component {
    state = {
        customerDialogOpen: false,
        importCustomersDialogOpen: false,
        pageSize: 20,
        typeFilter: "",
        popOvers: {},
        checked: {},
        bulkPopoverOpen: false
    };
    headers = [
        {

            ...header("", "id"),
            Cell: data => <input type="checkbox" checked={this.state.checked[data.original.id] === true}
                                 onChange={() => this.selectCustomer(data.original.id)}/>,
            width: 50,
            filterable: false,
            sortable: false
        },
        {
            ...header("Client Name", "name", nameFilter),
            Cell: data => <Link
                to={`/dashboard/customer/${data.original.id}`}>{`${data.original.first_name} ${data.original.last_name}`}</Link>
        },
        header("E-Mail Address", "email"),
        {
            ...header("Phone Number", "phone_number"),
            Cell: data => formatNumber(data.original.phone_number)
        },
        header("Address", "address"),
        header("City", "city"),
        {
            ...header("Actions"),
            Cell: data => [
                <Button key={1} className="mr-2" color="primary"
                        onClick={() => this.showBookings(data.original)}>Bookings</Button>,
                <Button key={2} color="danger"
                        onClick={() => this.setState({
                            popOvers: {
                                ...this.state.popOvers,
                                [data.original.id]: true
                            }
                        })}
                        disabled={this.props.deleting}
                        id={`deletePopover_${data.original.id}`}><Icon
                    icon={faTrash}/> Delete</Button>,
                <Popover key={3}
                         placement="left"
                         target={`deletePopover_${data.original.id}`}
                         isOpen={this.state.popOvers[data.original.id]}
                         toggle={() => this.setState({
                             popOvers: {
                                 ...this.state.popOvers,
                                 [data.original.id]: false
                             }
                         })}>
                    <PopoverHeader>Delete this Customer?</PopoverHeader>
                    <PopoverBody className="d-flex justify-content-between">
                        <Button color="danger"
                                onClick={() => this.deleteCustomer(data.original.id)}>
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
            ],
            filterable: false,
            sortable: false
        }
    ];
    tableState = undefined;

    filter = [];

    deleteCustomers = async () => {
        const response = await Promise.all(Object.keys(this.state.checked).map(id => customer.delete(id)));
        this.fetchData(this.tableState);
        this.setState({bulkPopoverOpen: !this.state.bulkPopoverOpen, checked: {}});
    };
    toggleCustomerDialog = () => {
        this.setState({customerDialogOpen: !this.state.customerDialogOpen})
    };
    toggleImportDialog = () => {
        this.setState({importCustomersDialogOpen: !this.state.importCustomersDialogOpen})
    };
    fetchData = (state) => {
        setTimeout(() => {
            state.pageSize = this.state.pageSize;
            this.tableState = state;
            if (this.filterChanged(state.filtered)) {
                debounce(() => {
                    this.props.getCustomers(
                        this.props.user.selectedCompany.id,
                        state.page * state.pageSize,
                        state.pageSize,
                        state.sorted,
                        state.filtered,
                        this.state.typeFilter === "" ? null : this.state.typeFilter)
                }, 500);
            } else {
                this.props.getCustomers(
                    this.props.user.selectedCompany.id,
                    state.page * state.pageSize,
                    state.pageSize,
                    state.sorted,
                    state.filtered,
                    this.state.typeFilter === "" ? null : this.state.typeFilter)
            }
        }, 100);
    };
    filterType = e => {
        if (e.target.value === '')
            this.setState({typeFilter: null}, () => {
                if (this.tableState) {
                    this.fetchData(this.tableState)
                }
            });
        else
            this.setState({typeFilter: e.target.value}, () => {
                if (this.tableState) {
                    this.fetchData(this.tableState)
                }
            });
    };

    calculatePageNumber() {
        if (this.props.data.total === -1)
            return 0;
        else {
            return Math.ceil(this.props.data.total / this.state.pageSize)
        }
    }

    selectCustomer(id) {
        const {checked} = this.state;
        if (checked[id] === undefined) {
            checked[id] = true;
        } else {
            delete checked[id];
        }
        this.setState({checked});
    }

    showBookings(customer) {

    }

    deleteCustomer(id) {
        this.props.deleteCustomer(id);
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

    async export(type) {
        this.setState({exporting: true});
        const response = await company.export(this.props.user.selectedCompany.id, type);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `customers-export-${moment().format("MM-DD-YYYY")}.${type === "csv" ? "csv" : "xlsx"}`;
        anchor.click();
        URL.revokeObjectURL(url);
        this.setState({exporting: false});
        this.fetchData(this.tableState);
    }

    render() {
        return (
            <Container fluid>
                <Row>
                    <Col md={3} lg={2} className="customer-actions pr-0">
                        <p className="text-center m-0 py-1 border-bottom">Actions</p>
                        <h5 className="d-flex border-bottom align-items-center p-2 m-0">
                            Filter:
                            <Input className="ml-2 py-0" style={{height: 33.6}} type="select"
                                   value={this.state.typeFilter} onChange={this.filterType}>
                                <option value="">All</option>
                                <option value="registered">Registered</option>
                                <option value="guest">Guests</option>
                            </Input>
                        </h5>
                        <h5 className="p-2 border-bottom w-100 m-0 d-flex align-items-center">
                            Export:
                            <Button color="link" onClick={() => this.export("csv")}>CSV</Button>
                            <Button color="link" onClick={() => this.export("excel")}>Excel</Button>
                            {this.state.exporting && <Icon icon={faSync} spin/>}
                        </h5>
                        <Button color="link" className="p-2 border-bottom w-100" onClick={this.toggleCustomerDialog}>
                            Create new customer
                        </Button>
                        <Button id="bulkDelete" color="link" className="p-2 border-bottom w-100"
                                onClick={() => this.setState({bulkPopoverOpen: !this.state.bulkPopoverOpen})}>
                            Bulk Delete
                        </Button>
                        <Popover isOpen={this.state.bulkPopoverOpen} target="bulkDelete"
                                 toggle={() => this.setState({bulkPopoverOpen: !this.state.bulkPopoverOpen})}>
                            <PopoverHeader>
                                Delete {Object.keys(this.state.checked).length} Customers?
                            </PopoverHeader>
                            <PopoverBody>
                                <Button color="danger"
                                        onClick={this.deleteCustomers}>
                                    Yes
                                </Button>
                                <Button color="secondary"
                                        onClick={() => this.setState({bulkPopoverOpen: !this.state.bulkPopoverOpen})}>
                                    Cancel
                                </Button>
                            </PopoverBody>
                        </Popover>
                        <Button color="link" className="p-2 border-bottom w-100" onClick={this.toggleImportDialog}>
                            Import from CSV
                        </Button>
                    </Col>
                    <Col md={10} className="px-0">
                        <Table key="table" data={this.props.data.customers}
                               pages={this.calculatePageNumber()}
                               loading={this.props.loading}
                               manual filterable
                               onFetchData={this.fetchData}
                               columns={this.headers} className="customer-table -striped"
                               pageSize={this.state.pageSize}
                               onPageSizeChange={(size) => this.setState({pageSize: size})}
                        />
                    </Col>
                    <CreateCustomerDialog isOpen={this.state.customerDialogOpen} toggle={this.toggleCustomerDialog}/>
                    <ImportCustomersDialog isOpen={this.state.importCustomersDialogOpen}
                                           toggle={this.toggleImportDialog}/>
                </Row>
            </Container>
        )
    }
}

function mapState(state) {
    return {...state.customer, user: state.user}
}

function mapDispatch(dispatch) {
    return bindActionCreators({getCustomers, deleteCustomer}, dispatch)
}

export default connect(mapState, mapDispatch)(Customers)