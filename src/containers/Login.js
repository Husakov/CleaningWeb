import React, {Component} from 'react';
import {Link} from 'react-router-dom'
import "./Login.css"

import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {login} from '../reducers/loginReducer';

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            password: "",
            requestFailed: false,
            error: {
                email: false,
                password: false
            }
        }
    }

    componentWillReceiveProps(newProps) {
        if (newProps.requestSent)
            this.props.history.push("/dashboard/calendar");
        if (newProps.requestFailed)
            this.setState({requestFailed: true})
    }

    handleSubmit(e) {
        e.preventDefault();
        let isValid = true;
        let fields = ["email", "password"];
        let error = this.state.error;
        for (let i = 0; i < fields.length; i++) {
            if (!(this.state[fields[i]].length > 0)) {
                isValid = false;
                let field = fields[i];
                error = {...error, [field]: true};
            }
            if (fields[i] === "password" && this.state[fields[i]].length < 6) {
                isValid = false;
                let field = fields[i];
                error = {...error, [field]: true};
            }
        }
        if (!isValid)
            this.setState({error});
        else {
            this.props.login(this.state.email, this.state.password);
        }
    }

    render() {
        return (
            <div className="Login container-fluid">
                <div className="row background">
                    <div className="login-container col-md-4 offset-md-4">
                        <div className="card">
                            <div className="card-header">
                                Log In
                            </div>
                            <div className="card-body">
                                <form onSubmit={(e) => this.handleSubmit(e)}>
                                    <div className="form-group">
                                        <label>EMAIL</label>
                                        <input type="email"
                                               className="form-control"
                                               placeholder="Email"
                                               required={this.state.error.email}
                                               onChange={(e) => this.setState({
                                                   email: e.target.value,
                                                   error: {...this.state.error, email: false},
                                                   requestFailed: false
                                               })}/>
                                        {this.state.error.email &&
                                        <div className="invalid-feedback"> Please enter valid email address </div>}
                                    </div>
                                    <div className="form-group">
                                        <label>PASSWORD</label>
                                        <input type="password"
                                               className="form-control"
                                               placeholder="Password"
                                               required={this.state.error.password}
                                               onChange={(e) => this.setState({
                                                   password: e.target.value,
                                                   error: {...this.state.error, password: false},
                                                   requestFailed: false
                                               })}/>
                                        {this.state.error.password &&
                                        <div className="invalid-feedback"> Password must be at least 6 characters
                                            long </div>}
                                    </div>
                                    <div className="form-check">
                                        <label className="form-check-label">
                                            <input type="checkbox" className="form-check-input"/>
                                            Remember me
                                        </label>
                                    </div>
                                    {this.state.requestFailed &&
                                    <div className="invalid-feedback">Invalid email or password</div>}
                                    <button type="submit" disabled={this.props.sendingRequest}
                                            className="btn btn-primary login-button">Submit
                                    </button>
                                </form>
                                <label className="forget-label">DONT HAVE AN ACCOUNT? <Link to="/register">SIGN
                                    UP</Link></label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        requestSent: state.login.requestSent,
        sendingRequest: state.login.sendingRequest,
        requestFailed: state.login.requestFailed
    };
};
const mapDispatchToProps = dispatch => {
    return bindActionCreators(
        {
            login: login
        },
        dispatch
    );
};
export default connect(mapStateToProps, mapDispatchToProps)(Login);
