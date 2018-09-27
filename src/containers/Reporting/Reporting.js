
import React from 'react';
import {Col, Container, Input, Label, Row, Table, Button} from "reactstrap";
import DatePicker from "react-datepicker";
import TableView, {makeHeader} from "../../components/Reports/TableView";
import * as api from "../../api";
import moment from "moment";
import {connect} from "react-redux";
import AppointmentModel from "../../model/appointment";
import ReactToPrint from 'react-to-print';

const titles=[
    [
        'Staff performance'
    ]
];
const dataHeaders = [



    [
        [
            makeHeader("Staff", 1),
            makeHeader("Customers", 2),
            makeHeader("Appointments", 8),
            makeHeader("Sales", 6),
        ],
        [
            makeHeader("Location", 1),
            makeHeader("Customers", 2),
            makeHeader("Appointments", 8),
            makeHeader("Sales", 6),
        ]
    ],



    [
        [
            makeHeader("Bookings", 2),
            makeHeader("Gift vouchers", 2),
            makeHeader("Sales", 7),
            makeHeader("Invoice total", 1),
        ]
    ],


    [
        [
            makeHeader("Staff name", 1),
            makeHeader("Total customers", 1),
            makeHeader("New customers", 1),
            makeHeader("Total bookings", 1),
            makeHeader("Services booked", 1),
            makeHeader("Online bookings", 1),
            makeHeader("Total value", 1),
        ] ,
        [
            makeHeader("Location name", 1),
            makeHeader("Total customers", 1),
            makeHeader("New customers", 1),
            makeHeader("Total bookings", 1),
            makeHeader("Services booked", 1),
            makeHeader("Online bookings", 1),
            makeHeader("Total value", 1),
        ] ,
        [
            makeHeader("Service name", 1),
            makeHeader("Total customers", 1),
            makeHeader("New customers", 1),
            makeHeader("Total bookings", 1),
            makeHeader("Services booked", 1),
            makeHeader("Online bookings", 1),
            makeHeader("Total value", 1),
        ]
    ],



    [
        [
            makeHeader("Customer name", 1),
            makeHeader("Email", 1),
            makeHeader("Telephone", 1),
            makeHeader("SMS number", 1),
            makeHeader("Bookings", 1),
            makeHeader("Services", 1),
            makeHeader("Booking value", 1),
            makeHeader("Invoiced service value", 1),
            makeHeader("Invoiced product value", 1),
            makeHeader("Discounts given", 1),
            makeHeader("Total invoiced value", 1),
        ]

    ],
    [],
    [],
    [
        [
            makeHeader("Service name", 1),
            makeHeader("Quantity sold", 1),
            makeHeader("Average sale", 1),
            makeHeader("Tax amount", 1),
            makeHeader("Gross value", 1),

        ]

    ],
    [],
    [
        [
            makeHeader("Payment", 1),
            makeHeader("Payment type", 1),
            makeHeader("Payment date", 1),
            makeHeader("Processed by", 1),
            makeHeader("Reference", 1),
            makeHeader("Customer", 1),
            makeHeader("Amount", 1),

        ]

    ],
 [
        [
            makeHeader("Invoice", 1),
            makeHeader("Date", 1),
            makeHeader("Customer", 1),
            makeHeader("Location", 1),
            makeHeader("Staff", 1),
            makeHeader("Type", 1),
            makeHeader("Description", 1),
            makeHeader("Unit Price", 1),
            makeHeader("Quantity", 1),
            makeHeader("Tax", 1),
            makeHeader("Amount", 1),

        ]

    ],

[],
    [],

    [
        [
            makeHeader("Staff member", 1),
            makeHeader("Gift voucher", 1),
            makeHeader("Qty purchased", 1),
            makeHeader("Purchased", 1),
            makeHeader("Redeemed", 1),
            makeHeader("Net change", 1),

        ],
        [
            makeHeader("Location", 1),
            makeHeader("Gift voucher", 1),
            makeHeader("Qty purchased", 1),
            makeHeader("Total purchased", 1),
            makeHeader("Total redeemed", 1),
            makeHeader("Net change", 1),

        ],
        [
            makeHeader("Staff member", 1),
            makeHeader("Qty purchased", 1),
            makeHeader("Purchased", 1),
            makeHeader("Redeemed", 1),
            makeHeader("Net change", 1),

        ],

    ],



    [
        [
            makeHeader("Staff member", 1),
            makeHeader("purchased", 1),
            makeHeader("Redeemed", 1),
            makeHeader("Net change", 1),

        ],
        [
            makeHeader("Location", 1),
            makeHeader("Total purchased", 1),
            makeHeader("Total redeemed", 1),
            makeHeader("Net change", 1),

        ],

    ],

    [
        [
            makeHeader("Invoice", 1),
            makeHeader("Invoice date", 1),
            makeHeader("Due date", 1),
            makeHeader("First name", 1),
            makeHeader("Last name", 1),
            makeHeader("Company name", 1),
            makeHeader("Location name", 1),
            makeHeader("Amount", 1),
            makeHeader("Outstanding", 1),
        ]

    ],
    [],
    [],
 [
        [
            makeHeader("Id", 1),
            makeHeader("Added", 1),
            makeHeader("First", 1),
            makeHeader("Last", 1),
            makeHeader("Company", 1),
            makeHeader("Email", 1),
            makeHeader("Tel", 1),
            makeHeader("Mobile", 1),
            makeHeader("Address1", 1),
            makeHeader("Address2", 1),
            makeHeader("Suburb", 1),
            makeHeader("City", 1),
            makeHeader("State", 1),
            makeHeader("Postcode", 1),
            makeHeader("DoB", 1),
            makeHeader("VIP", 1),
            makeHeader("Appts", 1),
            makeHeader("Last Appt", 1),
            makeHeader("Sex", 1),
            makeHeader("Job", 1),
            makeHeader("Refer", 1),
        ]

    ],
    [],
    [
        [
            makeHeader("Customer", 1),
            makeHeader("Gift voucher", 1),
            makeHeader("Recipient", 1),
            makeHeader("Status", 1),
            makeHeader("Code", 1),
            makeHeader("Expiry date", 1),
            makeHeader("Amount", 1),
            makeHeader("Redeemed", 1),
            makeHeader("Outstanding", 1),
        ]

    ],
    [
        [
            makeHeader("Customer", 1),
            makeHeader("Reason", 1),
            makeHeader("Status", 1),
            makeHeader("Expiry date", 1),
            makeHeader("Amount", 1),
            makeHeader("Redeemed", 1),
            makeHeader("Outstanding", 1),
        ]

    ],
    [
        [
            makeHeader("Id", 1),
            makeHeader("Added", 1),
            makeHeader("First", 1),
            makeHeader("Last", 1),
            makeHeader("Company", 1),
            makeHeader("Email", 1),
            makeHeader("Tel", 1),
            makeHeader("Mobile", 1),
            makeHeader("Address1", 1),
            makeHeader("Address2", 1),
            makeHeader("Suburb", 1),
            makeHeader("City", 1),
            makeHeader("State", 1),
            makeHeader("Postcode", 1),
            makeHeader("DoB", 1),
            makeHeader("VIP", 1),
            makeHeader("Appts", 1),
            makeHeader("Last Appt", 1),
            makeHeader("Sex", 1),
            makeHeader("Job", 1),
            makeHeader("Refer", 1),
        ]

    ],
    [],
    [
        [
            makeHeader("Staff name", 1),
            makeHeader("Customer", 1),
            makeHeader("Email", 1),
            makeHeader("SMS number", 1),
            makeHeader("Telephone", 1),
            makeHeader("Last booking", 1),
            makeHeader("Days absent", 1),
            makeHeader("Last service booked", 1),
            makeHeader("Last booking status", 1),
            makeHeader("New or returning?", 1),
            makeHeader("Booking made through", 1),
            makeHeader("Total customer spend", 1),

        ]

    ],
    [],



    [
        [
            makeHeader("Id", 1),
            makeHeader("Added", 1),
            makeHeader("First", 1),
            makeHeader("Last", 1),
            makeHeader("Company", 1),
            makeHeader("Email", 1),
            makeHeader("Tel", 1),
            makeHeader("Mobile", 1),
            makeHeader("Address1", 1),
            makeHeader("Address2", 1),
            makeHeader("Suburb", 1),
            makeHeader("City", 1),
            makeHeader("State", 1),
            makeHeader("Postcode", 1),
            makeHeader("DoB", 1),
            makeHeader("VIP", 1),
            makeHeader("Appts", 1),
            makeHeader("Last Appt", 1),
            makeHeader("Sex", 1),
            makeHeader("Job", 1),
            makeHeader("Refer", 1),
        ]

    ],

    [
        [
            makeHeader("Id", 1),
            makeHeader("Deleted (UTC Time)", 1),
            makeHeader("First", 1),
            makeHeader("Last", 1),
            makeHeader("Company", 1),
            makeHeader("Email", 1),
            makeHeader("Tel", 1),
            makeHeader("Mobile", 1),
            makeHeader("Address1", 1),
            makeHeader("Address2", 1),
            makeHeader("Suburb", 1),
            makeHeader("City", 1),
            makeHeader("State", 1),
            makeHeader("Postcode", 1),
            makeHeader("DoB", 1),
            makeHeader("VIP", 1),
            makeHeader("Appts", 1),
            makeHeader("Last Appt", 1),
            makeHeader("Sex", 1),
            makeHeader("Job", 1),
            makeHeader("Refer", 1),
        ]

    ],
    [
        [
            makeHeader("Id", 1),
            makeHeader("Added", 1),
            makeHeader("First", 1),
            makeHeader("Last", 1),
            makeHeader("Company", 1),
            makeHeader("Email", 1),
            makeHeader("Tel", 1),
            makeHeader("Mobile", 1),
            makeHeader("Address1", 1),
            makeHeader("Address2", 1),
            makeHeader("Suburb", 1),
            makeHeader("City", 1),
            makeHeader("State", 1),
            makeHeader("Postcode", 1),
            makeHeader("DoB", 1),
            makeHeader("VIP", 1),
            makeHeader("Appts", 1),
            makeHeader("Last Appt", 1),
            makeHeader("Sex", 1),
            makeHeader("Job", 1),
            makeHeader("Refer", 1),
        ]

    ],
    [
        [
            makeHeader("Free tasks", 1),
            makeHeader("Work start", 1),
            makeHeader("Work end", 1),
            makeHeader("Worked", 1),
            makeHeader("Busy", 1),
            makeHeader("Breaks", 1),
            makeHeader("Booked", 1),
            makeHeader("Booked %", 1),
        ]

    ],
    [
        [
            makeHeader("Date", 1),
            makeHeader("Is working", 1),
            makeHeader("Start", 1),
            makeHeader("End", 1),
            makeHeader("Duration", 1),
        ]

    ],

];

const dataSubheaders = [
    // 1.
    [
        ["Staff Name"],
        [
            "Total",
            "New"
        ],
        [
            "Total",
            "Services booked",
            "Retained",
            "Rebooked",
            "Online bookings",
            "Average visits",
            "Average value",
            "Appts. not invoiced"
        ],
        [
            "Invoiced service totals",
            "Invoiced product totals",
            "Invoiced packages",
            "Discounts given",
            "Refunds Issued",
            "Invoiced total"
        ]
    ],
    // 2.
    [
        ["Service booked",
            "Online bookings"
        ],
        [
            "Issued",
            "Redeemed"
        ],
        [
            "Average sale",
            "Number of sales",
            "Invoiced services",
            "Invoiced products",
            "Invoiced packages",
            "Less discounts",
            "Less refunds",
        ],
        [
            ""
        ]

    ],
//        3.
    [

    ],
    // 4.
    [


    ],
    //5
    [],
    //6
     [],
    //7.

    [

    ],
    [],
        //8
     [
    ],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],


];

const dataTypes = [
    (state) => state.staff
];

class Reporting extends React.Component {

    dataMappers = [
        //1.
        [
            (rowData, state) => [
            [() => rowData.name],
            [
                () => state.appointments.filter(this.dateFilter).filter(app => app.team_id === rowData.id).reduce((custList, app) => {
                    if (!custList.find(cust => cust.id === app.customer.id)) {
                        custList.push(app.customer);
                    }
                    return custList
                }, []).length,
                () => state.appointments.filter(this.dateFilter).filter(app => app.team_id === rowData.id && moment(app.created_at) > moment().subtract(7, "days")).reduce((custList, app) => {
                    if (!custList.find(cust => cust.id === app.customer.id)) {
                        custList.push(app.customer);
                    }
                    return custList
                }, []).length
            ],
            [
                () => state.appointments.filter(this.dateFilter).filter(app => app.team_id === rowData.id).length,
                () => state.appointments.filter(this.dateFilter).filter(app => app.team_id === rowData.id).reduce((services, appointment: AppointmentModel) => {
                    return services + appointment.appointment_services.length;
                }, 0),
                () => 0,
                () => 0,
                () => 0,
                () => 0,
                () => state.appointments.filter(this.dateFilter).filter(app => app.team_id === rowData.id).reduce((val, app: AppointmentModel) =>{
                    if (val === null){
                        return app.total
                    } else {
                        return (val + app.total) / 2
                    }
                }, null),
                () => 0,
            ],
            [
                () => 0,
                () => 0,
                () => 0,
                () => 0,
                () => 0,
                () => 0,
            ]
        ]
            ],
// 2.
       [
           (rowData, state) => [
            [
                () => 0,
                () => 0
            ],
            [
                () => 0,
                () => 0
            ],
            [
                () => 0,
                () => 0,
                () => 0,
                () => 0,
                () => 0,
                () => 0,
                () => 0
            ],
            [
                () => 0
            ]
               ]
        ],
// 3.
        [
        (rowData, state) => [
            [
                () => 0
            ],
            [
                () => 0
            ],
            [
                () => 0
            ],
            [
                () => 0
            ],
            [
                () => 0
            ],
            [
                () => 0
            ],
            [
                () => 0
            ],
        ]
        ],

// 4.
        [
        (rowData, state) => [
            [
                () => 0
            ],
            [
                () => 0
            ],
            [
                () => 0
            ],
            [
                () => 0
            ],
            [
                () => 0
            ],
            [
                () => 0
            ],
            [
                () => 0
            ],
            [
                () => 0
            ],
            [
                () => 0
            ],
            [
                () => 0
            ],
            [
                () => 0
            ],
        ]
        ],
//5.
        [],
        [],

        //6.

        [
            (rowData, state) => [
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
               ]


        ],
        [],
        [
            (rowData, state) => [
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
               ]


        ],
[
            (rowData, state) => [
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
               ]


        ],
        [],
        [],
[
            (rowData, state) => [
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
               ]


        ],
[
            (rowData, state) => [
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
               ]


        ],
        [
            (rowData, state) => [
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
               ]


        ],
        [],
        [],

 [
            (rowData, state) => [
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
               ]


        ],
        [],
        [
            (rowData, state) => [
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
            ]
        ],
[
            (rowData, state) => [
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
            ]
        ],
        [
            (rowData, state) => [
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
            ]


        ],
        [],
        [
            (rowData, state) => [
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
        ]
            ],
        [],
        [
            (rowData, state) => [
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
            ]


        ],

        [
            (rowData, state) => [
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
            ]


        ],
        [
            (rowData, state) => [
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
            ]


        ],




        [
            (rowData, state) => [
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                ]
        ],


        [
            (rowData, state) => [
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
                [
                    () => 0
                ],
            ]
            ],


    ];

    async componentDidMount() {
        const companyID = this.props.user.selectedCompany.id;

        const [customers, quotes, appointments, invoices, staff] = await Promise.all([
            api.company.customers(companyID, 0, 9999, [], [], null).then(res => res.customers),
            api.quotes.getQuotes(companyID, 0, 9999, [], [], null).then(res => res.quotes),
            api.appointment(companyID).list(moment().subtract(1, "year").toISOString(), moment().add(1, "year").toISOString()).then(res => res.appointments),
            api.invoices.get(companyID, 0, 9999, [], []).then(res => res.invoices),
            api.staff.list(companyID).then(teams => teams.filter(team => team.id > 0))
        ]);

        this.setState({customers, quotes, appointments, invoices, staff, loaded: true})
    }

    dateFilter = item => {
        let bool = true;
        if (this.state.startDate){
            bool = bool && moment(item.created_at) > this.state.startDate;
        }
        if (this.state.endDate){
            bool = bool && moment(item.created_at) < this.state.endDate;
        }
        return bool;
    };

    state = {
        selectedView: 0,
        loaded: false,
        startDate: null,
        endDate: null
    };

    exportCsv = () => {
        const {selectedView} = this.state;
        let csv = dataHeaders[selectedView].reduce((csvHead, header, i) =>
                [...csvHead, ...dataSubheaders[selectedView][i].map(subHeader => `${header.title} - ${subHeader}`)]
            , []).join(",");
        csv += "\n";
        dataTypes[selectedView](this.state).forEach((row) =>
            csv += `${this.dataMappers[selectedView](row, this.state).reduce((data, dataGroup) =>
                    [...data, ...dataGroup.map(dataItem => dataItem())]
                , []).join(",")}\n`
        );
        const url = URL.createObjectURL(new Blob([csv], {type: 'text/plain'}));
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `export-${moment().format("MM-DD-YYYY")}.csv`;
        anchor.click();
        URL.revokeObjectURL(url);
    };

    render() {
        const {selectedView, loaded, startDate, endDate} = this.state;
        return (
            loaded &&
            <Container fluid className="h-100">
                <Row className="h-100">
                    <Col md={3} lg={2} className="customer-actions p-0 h-100">
                        <p className="text-center m-0 py-1 border-bottom">Reports</p>
                        <div className="p-3">
                            <Label>Choose a report</Label>
                            <Input type="select" value={selectedView} onChange={e => this.setState({selectedView: e.target.value})}>
                                <optgroup label="Business Performance">
                                    <option value="0">Executive Summary</option>
                                    <option value="1">Monthly Summary</option>
                                    <option value="2">Future Value</option>
                                    <option value="3">Customer Spend</option>
                                </optgroup>
                                <optgroup label="Financial">
                                    <option value="5">Sales report</option>
                                    <option value="6">Service sales</option>
                                    <option value="8">Transaction summary</option>
                                    <option value="9">Invoice detail</option>
                                    <option value="12">Gift voucher activity</option>
                                    <option value="13">Credit activity</option>
                                    <option value="14">Unpaid invoices</option>
                                </optgroup>
                                <optgroup label="Customers">
                                    <option value="17">Customers by date added</option>
                                    <option value="19">Customer gift voucher details</option>
                                    <option value="20">Customer credit details</option>
                                    <option value="21">Customer birthdays</option>
                                    <option value="22">Customers absent since</option>
                                    <option value="23">Clients not retained</option>
                                    <option value="24">Customer notes</option>
                                    <option value="25">Duplicate customer list</option>
                                    <option value="26">Deleted customer list</option>
                                    <option value="27">Customers by service</option>
                                </optgroup>
                                <optgroup label="Staff">
                                    <option value="28">Staff timesheet</option>
                                    <option value="29">Staff roster</option>
                                    <option value="30">Staff appointment summary</option>
                                </optgroup>
                            </Input>
                            <Label>Start Date</Label>
                            <DatePicker className="form-control" selected={startDate} onChange={date => this.setState({startDate: date})}/>
                            <Label>End Date</Label>
                            <DatePicker className="form-control" selected={endDate} onChange={date => this.setState({endDate: date})}/>
                            <Button color="link" className="d-block" onClick={this.exportCsv}>Export as CSV</Button>
                            <ReactToPrint trigger={() => <Button color="link" className="d-block">Print</Button>} content={() => this.contentRef}/>
                        </div>
                    </Col>
                    <Col  md={9} lg={10} className="h-100 p-0">{dataHeaders[selectedView].map((item,index)=>{
                        return(
                            <div style={{padding:"2em"}}>
                                <TableView
                                    title={titles[selectedView] ? titles[selectedView].title : ""}
                                    headers={dataHeaders[selectedView][index]}
                                    subheaders={dataSubheaders[selectedView]}
                                    data={dataTypes[0](this.state).map(rowData => this.dataMappers[selectedView][this.dataMappers[selectedView]>0 ? index : 0](rowData, this.state))}
                                />
                            </div>
                        )})}
                    </Col>
                </Row>
            </Container>
        )
    }
}

function mapState(state) {
    return {
        ...state
    }
}

export default connect(mapState)(Reporting);
