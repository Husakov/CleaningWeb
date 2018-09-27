import React, {Fragment} from 'react'
import Navigation from "../components/Navigation";
import {Route, Switch} from "react-router-dom";
import Loadable from 'react-loadable';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {getData} from '../reducers/userReducer'
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.min.css';
import Spinner from 'react-spinkit';

const loadableComponent = (loader) => Loadable({
    loader,
    loading: () => <Spinner/>
});

const asyncCalendar = loadableComponent(() => import('./Calendar/Calendar'));
const asyncServices = loadableComponent(() => import('./Services'));
const asyncStaff = loadableComponent(() => import('./Staff/Staff'));
const asyncMarketing = loadableComponent(() => import('./Marketing/Marketing'));
const asyncQuotes = loadableComponent(() => import('./Quotes/Quotes'));
const asyncCustomers = loadableComponent(() => import('./Customers'));
const asyncCustomerInfo = loadableComponent(() => import('./CustomerInfo'));
const asyncInvoiceList = loadableComponent(() => import('./Pos/InvoiceList'));
const asyncHome = loadableComponent(() => import('./Home'));
const asyncReporting = loadableComponent(() => import('./Reporting/Reporting'));
const asyncSettings = loadableComponent(() => import('./Settings/Settings'));
const asyncChat = loadableComponent(() => import('./Chat/Chat'));

class Dashboard extends React.Component {
    componentDidMount() {
        this.props.getData();
    }

    componentWillReceiveProps(props, data) {
        if (props.user.error) {
            localStorage.removeItem("token");
            props.history.push("/login");
        }
    }

    render() {
        return this.props.user.id ? (
            <Fragment>
                <Navigation/>
                <ToastContainer/>
                <main className="flex-1">
                    <Switch>
                        <Route exact path="/dashboard/calendar" component={asyncCalendar}/>
                        <Route exact path="/dashboard/services" component={asyncServices}/>
                        <Route exact path="/dashboard/staff" component={asyncStaff}/>
                        <Route exact path="/dashboard/customers" component={asyncCustomers}/>
                        <Route path="/dashboard/customer/:id" component={asyncCustomerInfo}/>
                        <Route exact path="/dashboard/marketing" component={asyncMarketing}/>
                        <Route exact path="/dashboard/quotes" component={asyncQuotes}/>
                        <Route exact path="/dashboard/pos" component={asyncInvoiceList}/>
                        <Route exact path="/dashboard/home" component={asyncHome}/>
                        <Route exact path="/dashboard/reports" component={asyncReporting}/>
                        <Route exact path="/dashboard/settings" component={asyncSettings}/>
                        <Route exact path="/dashboard/chat" component={asyncChat}/>
                    </Switch>
                </main>
            </Fragment>
        ) : null
    }
}

export default connect((state) => ({user: state.user}), (dispatch) => bindActionCreators({getData}, dispatch))(Dashboard);
