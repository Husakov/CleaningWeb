import React, {Component} from 'react';
import {Button, Card, CardBody, CardHeader} from "reactstrap";
import {connect} from 'react-redux';
import FilterableChart from "../components/FilterableChart";
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import {Responsive, WidthProvider} from 'react-grid-layout';
import * as api from '../api';
import './home.css';
import moment from "moment";
import {faDollarSign, faPlus} from "@fortawesome/fontawesome-free-solid/shakable.es";
import Icon from '@fortawesome/react-fontawesome';
import ConfigurationModal from '../components/ConfigurationModal';
import LabelConfigurationModal from "../components/LabelConfigurationModal";
import {IconMap} from '../util';
import {bindActionCreators} from "redux";
import {updateDashboard} from "../reducers/userReducer";

const ResponsiveGrid = WidthProvider(Responsive);

const safeGet = (item, def = {}) => item ? item : def;
const item = (label, type, id, data) => ({label, type, id: String(id), data});
const chartItem = (label, id, dataSet, timeRange, groupBy = "month", filter = () => true) => item(label, "graph", id, {
    dataSet,
    timeRange,
    groupBy,
    filter
});
const modifiableChartItem = (label, id, dataSet, timeRange, groupBy = "month", filter = () => true, valueMap = 'count', filterByField = null, filterByOperator = null, filterByValue = null) => item(label, "modifiableGraph", id, {
    dataSet,
    timeRange,
    groupBy,
    filter,
    valueMap,
    filterByField,
    filterByOperator,
    filterByValue
});

const addChartButtonItem = (label, id) => item(label, "addChartButton", id, {});
const addLabelButtonItem = (label, id) => item(label, "addLabelButton", id, {});

const labelItem = (label, id, color, icon, dataSet, filter, reduce = (data) => data.length) => item(label, "label", id, {
    dataSet,
    filter,
    color,
    icon,
    reduce
});

class Home extends Component {


    // noinspection JSUnusedAssignment
    types = {
        addChartButton:{
            layoutParams: {minW: 3, minH: 1},
            Element: ({id, ...props}) =>
                <Card onClick={()=>this.addChart()} key={id} className="h-100 dragMeNot" style={{backgroundColor: "red", color: "white"}}>
                    <CardBody className="d-flex align-items-center pointer-hover card-body-label">
                        <div className="mr-3 label-icon">
                            <Icon icon={faPlus}/>
                        </div>
                        <div>
                            <h5 className="mb-0">{props.label}</h5>
                        </div>
                    </CardBody>
                </Card>
        },
        addLabelButton:{
            layoutParams: {minW: 3, minH: 1},
            Element: ({id, ...props}) =>
                <Card onClick={()=>this.addLabel()} key={id} className="h-100 pointer-hover dragMeNot" style={{backgroundColor: "blue", color: "white"}}>
                    <CardBody className="d-flex align-items-center card-body-label">
                        <div className="mr-3 label-icon">
                            <Icon icon={faPlus}/>
                        </div>
                        <div>
                            <h5 className="mb-0">{props.label}</h5>
                        </div>
                    </CardBody>
                </Card>
        },
        label: {
            layoutParams: {minW: 3, minH: 1}, Element: ({dataSet, filter, id, label, color, icon, reduce, ...props}) =>
                <Card key={id} className="h-100" style={{backgroundColor: color, color: "white"}}>
                    <CardBody className="grid-card card-body-label justify-content-around dragMe">

                        <div className="d-flex h-100 justify-content-between">
                            <div className="d-flex mr-3 label-icon align-items-center align-self-center">
                                <Icon icon={this.getIcon(icon)}/>
                            </div>
                            <div className="d-flex flex-column justify-content-center align-items-center mr-3">
                                <span>{this.state.chartSettings.find(item => item.id == id).label}</span>
                                <span>{safeGet(this.state[this.state.chartSettings.find(item => item.id == id).dataSet], [])
                                    .filter(this.getFilter(this.state.chartSettings.find(item => item.id == id).dataSet.filterByOperator,
                                        this.state.chartSettings.find(item => item.id == id).dataSet.filterByField,
                                        this.state.chartSettings.find(item => item.id == id).dataSet.filterByValue))
                                    //.reduce(item=>{if(item != undefined) return 1; else return 0;}, 0)}</span>
                                    .length}</span>
                            </div>

                            <LabelConfigurationModal settings={{
                                id: id,
                                labelName: 'Edit Label',
                                ...this.state.chartSettings.find(item => item.id == id)
                            }}
                                                     modalOpened={this.state.chartSettings.find(item => item.id == id).modalOpened}
                                                     modifySettings={this.modifySettings}
                                                     saveToApi={this.saveSettings}
                                                     removeLabel={this.removeLabel}
                                                     changeModalOpened={this.changeModalOpened}

                            />
                        </div>



                    </CardBody>
                </Card>
        },
        modifiableGraph: {
            layoutParams: {minW: 4, minH: 4},
            Element: ({dataSet, filter, ...props}) =>
                <Card className="grid-card h-100">
                    <CardHeader className="dragMe">
                        <div className="d-flex justify-content-between">
                            <span>{this.state.chartSettings.find(item => item.id == props.id).label}</span>
                            <ConfigurationModal
                                settings={{
                                    id: props.id,
                                    labelName: 'Edit Chart',
                                    ...this.state.chartSettings.find(item => item.id == props.id)
                                }}
                                modalOpened={this.state.chartSettings.find(item => item.id == props.id).modalOpened}
                                modifySettings={this.modifySettings}
                                saveToApi={this.saveSettings}
                                removeChart={this.removeChart}
                                changeModalOpened={this.changeModalOpened}

                            />
                        </div>
                    </CardHeader>
                    <CardBody className="grid-card">
                        <FilterableChart valueMapping={this.state.chartSettings.find(item => item.id == props.id).valueMap}

                                         filtersNew={this.state.chartSettings.find(item => item.id == props.id).filters.map(filter => {
                                             let newFilter = {...filter};

                                             newFilter.dataSet = safeGet(this.state[filter.dataSet], []).filter(this.getFilter(filter.filterByOperator, filter.filterByField, filter.filterByValue));
                                             return newFilter;
                                         })}

                                         {...props}
                                         chartType={this.state.chartSettings.find(item => item.id == props.id).chartType}/>
                    </CardBody>
                </Card>
        },

    };
    layoutItem = (type, i, x, y, w, h) => ({i: String(i), x, y, w, h, ...this.types[type].layoutParams});
    state = {
        chartSettings: [],
        modalOpened: false,
        items: []
    };

    defaultSettings = {
        chartSettings: [{
            id:0,
            filterByField: null,
            filterByOperator: '>',
            valueMap: 'count',
            dataSet: 'customers',
            startDate: moment().subtract(1, "year"),
            endDate: moment().add(1, "year"),
            groupBy: "month",
            modalOpened: false,
            label: "New Customers",
            filters: [

                /*{
                    id: 0,
                    color: '#aaaaaa',
                    dataSet: 'invoices',
                    filterByField: null,
                    filterByOperator: '>',
                    filterByValue: 0,
                    label: 'New Invoices',
                },
                {
                    id: 1,
                    color: '#000000',
                    dataSet: 'customers',
                    filterByField: null,
                    filterByOperator: '>',
                    filterByValue: 0,
                    label: 'New Customers',
                },*/
            ]
        },{
            id:5,
            filterByField: null,
            filterByOperator: '>',
            valueMap: 'count',
            icon: 'dollar',
            modalOpened: false,
            dataSet: 'invoices',
            startDate: moment().subtract(1, "year"),
            endDate: moment().add(1, "year"),
            groupBy: "month",
            label: "Unpaid Invoices",


        },{
            id:6,
            filterByField: null,
            filterByOperator: '>',
            valueMap: 'count',
            modalOpened: false,
            icon: 'dollar',
            dataSet: 'invoices',
            startDate: moment().subtract(1, "year"),
            endDate: moment().add(1, "year"),
            groupBy: "month",
            label: "New Invoices",

        },{
            id:7,
            filterByField: null,
            filterByOperator: '>',
            valueMap: 'count',
            chartType: 'line',
            modalOpened: false,
            icon: 'dollar',
            dataSet: 'appointments',
            startDate: moment().subtract(1, "year"),
            endDate: moment().add(1, "year"),
            groupBy: "month",
            label: "Upcoming Appointments",

        },{
            id:8,
            filterByField: null,
            filterByOperator: '>',
            modalOpened: false,
            valueMap: 'count',
            chartType: 'line',
            icon: 'dollar',
            dataSet: 'quotes',
            startDate: moment().subtract(1, "year"),
            endDate: moment().add(1, "year"),
            groupBy: "month",
            label: "Pending Quotes",

        },/* {
            id:1,
            filterByField: null,
            filterByOperator: '>',
            valueMap: 'count',
            dataSet: 'quotes',
            startDate: moment().subtract(1, "year"),
            endDate: moment(),
            groupBy: "month",
            label: "New Quotes",
            filters: [

                {
                    id: 0,
                    color: '#aaaaaa',
                    dataSet: 'quotes',
                    filterByField: null,
                    filterByOperator: '>',
                    filterByValue: 0,
                    label: 'New Quotes',
                },
            ]
        }, {
            id:2,
            filterByField: null,
            filterByOperator: '>',
            valueMap: 'count',
            dataSet: 'appointments',
            startDate: moment().subtract(1, "year"),
            endDate: moment(),
            groupBy: "month",
            label: "New Appointments",
            filters: [

                {
                    id: 0,
                    color: '#aaaaaa',
                    dataSet: 'quotes',
                    filterByField: null,
                    filterByOperator: '>',
                    filterByValue: 0,
                    label: 'New Appointments',
                },
            ]
        }*/

        ],items: [
            modifiableChartItem("New Customers", 0, "customers", [moment().subtract(1, "year"), moment().add(1, "year")], "month", null, 'count', null, '>'),
            labelItem("Total Revenue", 5, "#4CAF50", 'dollar', "invoices", (invoice) => invoice.status === "Paid",
                data => data.reduce((sum, invoice) => (sum += invoice.amount), 0)),
            labelItem("Unpaid Invoices", 6, "#E53935", 'dollar', "invoices", (invoice) => invoice.status !== "Paid"),
            labelItem("Upcoming Appointments", 7, "#1565C0", 'dollar', "appointments", app => moment(app.start_time) > moment()),
            labelItem("Pending Quotes", 8, "#00BCD4", 'dollar', "quotes", (q) => q.status === "Sent"),
            /*chartItem("New Quotes", 1, "quotes", [moment().subtract(1, "year"), moment()]),
            chartItem("New Appointments", 2, "appointments", [moment().subtract(1, "year"), moment()]),*/
            addChartButtonItem("Add Chart", 3),
            addLabelButtonItem("Add Label", 4),
        ],
        layouts: {
            lg: [
                this.layoutItem("addChartButton", 3, 0, 0, 3, 1),
                this.layoutItem("addLabelButton", 4, 3, 0, 3, 1),
                this.layoutItem("label", 5, 6, 0, 3, 1 ),
                this.layoutItem("label", 6, 9, 0, 3, 1),
                this.layoutItem("label", 7, 0, 1, 3, 1),
                this.layoutItem("label", 8, 3, 1, 3, 1),
                this.layoutItem("modifiableGraph", 0, 0, 2, 12, 5),
                /*this.layoutItem("graph", 1, 0, 3, 6, 5),
                this.layoutItem("graph", 2, 6, 3, 6, 5),*/
            ]
        }
    }

    layoutChanged = (layout, layouts) => {
        this.setState({layouts});
        this.saveSettings();
    };

    getFilter = (operator, field, value) => {


        if (operator == null || field == null || value == null)
            return () => {
                return true
            };

        switch (operator) {

            case '>':

                return (item) => {
                    if (item[field] > value) {
                        return parseInt(item[field]) > parseInt(value);
                    }
                };

            case '!=':
                return (item) => {
                    return item[field] != value
                };

            case '=':

                return (item) => {
                    return item[field] == value
                };

            case '<':
                return (item) => {
                    return parseInt(item[field]) < parseInt(value)
                };

            default:
                return () => {
                    return true
                };
        }
    };

    modifySettings = (settings, saveToApi=false) => {
        let newSettings = [...this.state.chartSettings];

        newSettings.splice(newSettings.findIndex(item=>item.id==settings.id), 1);
        console.log(settings);
        newSettings.push({...settings});
        this.setState({chartSettings: newSettings}, ()=>{
            if(saveToApi) this.saveSettings();
            this.reEnterComponent(settings.id);

        });

    }



    changeModalOpened = () =>{
        this.setState({ modalOpened: !this.state.modalOpened });
    }

    changeLabelModalOpened = () =>{
        this.setState({ labelModalOpened: !this.state.labelModalOpened });
    }

    addLabel = () => {
        let newLayoutsLg = [ ...this.state.layouts.lg];
        let newItems = [ ...this.state.items];
        let newSettings = [ ...this.state.chartSettings];

        let biggestID = newItems.reduce((max, item) => parseInt(item.id) > max ? parseInt(item.id) : max, parseInt(newItems[0].id));



        const newID = biggestID + 1;

        console.log("ADD NEW LABEL");

        newSettings.push({
            id:newID,
            modalOpened: true,
            filterByField: null,
            filterByOperator: '>',
            valueMap: 'count',
            dataSet: 'customers',
            icon: 'dollar',
            startDate: moment().subtract(1, "year"),
            endDate: moment().add(1, "year"),
            groupBy: "month",
            label: "New Label"
        });

        newLayoutsLg.push(this.layoutItem("label", newID, 6, 1, 3, 1));
        newItems.push(labelItem("Pending Quotes", newID, "#00BCD4", 'dollar', "quotes", (q) => q.status === "Sent"));

        this.setState({
            layouts: {lg: newLayoutsLg},
            items: newItems,
            chartSettings: newSettings
        });
    };

    removeLabel = (id) => {
        this.removeChart(id);
    };

    addChart = () => {
        let newSettings = [ ...this.state.chartSettings];
        let newLayoutsLg = [ ...this.state.layouts.lg];
        let newItems = [ ...this.state.items];

        let biggestID = newItems.reduce((max, item) => parseInt(item.id) > max ? parseInt(item.id) : max, parseInt(newItems[0].id));

        const newID = biggestID + 1;


        newSettings.push({
            id:newID,
            chartType: 'line',
            filterByField: null,
            filterByOperator: '>',
            modalOpened: true,
            valueMap: 'count',
            dataSet: 'customers',
            startDate: moment().subtract(1, "year"),
            endDate: moment().add(1, "year"),
            groupBy: "month",
            label: "New Chart",
            filters: [

                {
                    id: 0,
                    color: '#000000',
                    dataSet: 'customers',
                    filterByField: null,
                    filterByOperator: '>',
                    filterByValue: 0,
                    label: 'New Customers',
                },
            ]
        });

        newItems.push(modifiableChartItem("New Chart", newID, "customers", [moment().subtract(1, "year"), moment().add(1, "year")], "month", () => {
            return true;
        }, 'count', null, '>'),);

        let biggestY = newLayoutsLg.reduce((max, item) => item.id > max ? item.y : max, newItems[0].y);
        biggestY++;

        newLayoutsLg.push(this.layoutItem("modifiableGraph", newID, 0, biggestY, 12, 5));
        this.setState({
            chartSettings: newSettings,
            layouts: {lg: newLayoutsLg},
            items: newItems
        });

    };

    removeChart = (id) => {


        let newSettings = [ ...this.state.chartSettings];
        let newLayoutsLg = [ ...this.state.layouts.lg];
        let newItems = [ ...this.state.items];


        newSettings.splice(newSettings.findIndex(item=>item.id==id), 1);
        newLayoutsLg.splice(newLayoutsLg.findIndex(item=>item.i==id), 1);
        newItems.splice(newItems.findIndex(item=>item.id==id), 1);

        this.setState({
            chartSettings: newSettings,
            layouts: {lg: newLayoutsLg},
            items: newItems
        });
    };

    async componentDidMount() {
        const companyID = this.props.user.selectedCompany.id;


        const [customers, quotes, appointments, invoices] = await Promise.all([
            api.company.customers(companyID, 0, 9999, [], [], null).then(res => res.customers),
            api.quotes.getQuotes(companyID, 0, 9999, [], [], null).then(res => res.quotes),
            api.appointment(companyID).list(moment().subtract(1, "year").toISOString(), moment().add(1, "year").toISOString()).then(res => res.appointments),
            api.invoices.get(companyID, 0, 9999, [], []).then(res => res.invoices),
        ]);



        if (this.props.user.selectedCompany.dashboard != null) {
            let settings = JSON.parse(this.props.user.selectedCompany.dashboard);
            console.log(settings);
            if (settings.chartSettings.length === 0){
                this.setState({customers, quotes, appointments, invoices, ...this.defaultSettings});
            } else {
                this.setState(settings, () => {
                    this.setState({customers, quotes, appointments, invoices});
                });
            }
        } else {
            this.setState({customers, quotes, appointments, invoices, ...this.defaultSettings})
        }
        setTimeout(() => {
            this.state.chartSettings.forEach(item => { this.reEnterComponent(item.id)})
        }, 10);
    }

    saveSettings = async () => {
        const companyID = this.props.user.selectedCompany.id;

        let stateToSave = {
            chartSettings: [...this.state.chartSettings],
            layouts: {...this.state.layouts},
            items: [...this.state.items]
        }
        await api.company.edit(companyID, JSON.stringify(stateToSave)).then(res=>{console.log("SAVED");});
        this.props.updateDashboard(JSON.stringify(stateToSave));
    }

    componentDidUpdate(oldProps){
    }



    getIcon(icon){
        return IconMap.find( item => item.value == icon).icon;
    }

    reEnterComponent(id) {
        let newItems = [...this.state.items];
        let newItem = null;
        let newIndex = null;

        let settings = this.state.chartSettings.find(item => item.id == id);

        newItems.forEach((item, index) => {
            if (item.id == id) {
                newItem = {...item};
                newIndex = index;
            }
        });
        newItem.label=settings.label;
        newItem.data = {...newItem.data};
        newItem.data.label = settings.label;
        newItem.data.timeRange = [settings.startDate, settings.endDate];
        newItem.data.groupBy = settings.groupBy;
        newItem.data.icon = settings.icon;
        newItem.data.dataSet = settings.dataSet;
        newItem.data.valueMap = settings.valueMap;
        if(settings.filters != null) {
            newItem.data.filters = [...settings.filters];

        }

        newItem.data.filterByField = settings.filterByField;
        newItem.data.filterByOperator = settings.filterByOperator;
        newItem.data.filterByValue = settings.filterByValue;
        newItem.data.filter = this.getFilter(settings.filterByOperator, settings.filterByField, settings.filterByValue);

        if(newIndex != null){
            newItems.splice(newIndex, 1, newItem);
        }else{
            newItems.push(newItem);
        }


        this.setState({items: newItems});
    }

    render() {

        return (

            <ResponsiveGrid cols={{lg: 12, md: 10, sm: 6, xs: 4, xxs: 2}} rowHeight={100}
                            style={{height: "100%", width: "100%"}}
                            useCSSTransforms={true}
                            draggableHandle=".dragMe"
                            onLayoutChange={this.layoutChanged}
                            layouts={this.state.layouts}
                            breakpoints={{lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0}}>

                {this.state.items.map(item => {
                    const {Element} = this.types[item.type];
                    return (
                        <div key={item.id}>

                            <Element {...item.data} label={item.label} id={item.id} />
                        </div>
                    )
                })}
            </ResponsiveGrid>

        )
    }
}

function mapState(state) {
    return {
        ...state
    }
}

function mapActions(dispatch) {
    return bindActionCreators({updateDashboard}, dispatch)
}

export default connect(mapState, mapActions)(Home);
