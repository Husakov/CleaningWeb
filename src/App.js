import React, {Component} from 'react';
import {BrowserRouter as Router, Redirect, Route, Switch} from "react-router-dom";
import Login from './containers/Login';
import Register from './containers/Register'
import Dashboard from "./containers/Dashboard";
import {hot} from 'react-hot-loader';

import {Provider} from 'react-redux';
import store from './store';
import 'react-datepicker/dist/react-datepicker.min.css'
import './App.css'
import {STRIPE_API_KEY} from "./config";
import {StripeProvider} from "react-stripe-elements";

//import { bindActionCreators } from "redux";
//import { connect } from "react-redux";


const PrivateRoute = ({component: Component, ...rest}) => (
    <Route
        {...rest}
        render={props =>
            localStorage.getItem("token") ? (
                <Component {...props} />
            ) : (
                <Redirect
                    to={{
                        pathname: "/login",
                        state: {from: props.location}
                    }}
                />
            )
        }
    />
);
const PublicRoute = ({component: Component, ...rest}) => (
    <Route
        {...rest}
        render={props =>
            !localStorage.getItem("token") ? (
                <Component {...props} />
            ) : (
                <Redirect
                    to={{
                        pathname: "/dashboard",
                        state: {from: props.location}
                    }}
                />
            )
        }
    />
);

class App extends Component {
    state = {
        stripe: null
    };

    componentDidMount() {
        if (window.Stripe) {
            this.setState({stripe: window.Stripe(STRIPE_API_KEY)})
        } else {
            document.querySelector('#stripe-js').addEventListener('load', () => {
                // Create Stripe instance once Stripe.js loads
                this.setState({stripe: window.Stripe(STRIPE_API_KEY)});
            });
        }
    }

    render() {
        return (
            <StripeProvider stripe={this.state.stripe}>
                <Provider store={store}>
                    <Router>
                        <Switch>
                            <PublicRoute exact path='/' component={Login}/>
                            <PublicRoute exact path="/login" component={Login}/>
                            <PublicRoute exact path="/register" component={Register}/>
                            <PrivateRoute path="/dashboard" component={Dashboard}/>
                        </Switch>
                    </Router>
                </Provider>
            </StripeProvider>
        );
    }
}

export default hot(module)(App);
