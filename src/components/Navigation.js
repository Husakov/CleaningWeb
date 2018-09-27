import React from 'react'
import {
    Collapse,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Nav,
    Navbar,
    NavbarToggler,
    NavItem
} from "reactstrap";
import {NavLink, withRouter} from "react-router-dom";
import Icon from '@fortawesome/react-fontawesome'
import {
    faBell,
    faBullhorn,
    faCalendarAlt,
    faCog,
    faComments,
    faFilePdf,
    faHome,
    faList,
    faMobile,
    faPowerOff,
    faServer,
    faTags,
    faUser,
    faUsers
} from "@fortawesome/fontawesome-free-solid/shakable.es";
import './Navigation.css'
import {auth} from "../api";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {selectCompany} from "../reducers/userReducer";

class Navigation extends React.Component {
    state = {
        isOpen: false,
        companyDropdownOpen: false
    };
    handleCompanyClick = () => {
        this.setState({
            companyDropdownOpen: !this.state.companyDropdownOpen
        })
    };

    toggle() {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }

    async logout() {
        try {
            await auth.logout()
        } catch (e) {

        }
        this.props.history.push('/login');
    }

    handleClick() {
        this.setState({
            isOpen: false
        })
    }

    render() {
        return [
            <div key="navbar" className="navigation">
                <div className="top-bar d-none d-lg-flex">
                    <div className="d-flex">
                        <Dropdown isOpen={this.state.companyDropdownOpen} toggle={this.handleCompanyClick}
                                  className="ml-3">
                            <DropdownToggle className="company-toggle" caret>
                                {this.props.user.selectedCompany.name}
                            </DropdownToggle>
                            <DropdownMenu>
                                {this.props.user.companies.map(company =>
                                    <DropdownItem key={company.id}
                                                  onClick={() => this.props.selectCompany(company)}>{company.name}</DropdownItem>
                                )}
                                <DropdownItem>Add new company</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                    <div className="d-flex">
                        <a href="#" className="top-bar-item">
                            <Icon icon={faBell}/>
                        </a>
                        <a href="#" className="top-bar-item">
                            <Icon icon={faUser}/>
                            Profile
                        </a>
                        <a href="#" className="top-bar-item">
                            <Icon icon={faMobile}/>
                            Contact Support
                        </a>
                        <a href="#" onClick={() => this.logout()} className="top-bar-item">
                            <Icon icon={faPowerOff}/>
                            Log out
                        </a>
                    </div>
                </div>
                <Navbar expand="lg" dark className="pb-0 pt-0">
                    <NavbarToggler className="m-2" onClick={() => this.toggle()}/>
                    <a href="#" className="mobile-notification-toggler d-flex align-items-center d-lg-none mr-3">
                        <Icon icon={faBell}/>
                    </a>
                    <Collapse isOpen={this.state.isOpen} navbar>
                        <Nav navbar>
                            <NavItem>
                                <NavLink className="nav-link" to="/dashboard/home" onClick={e => this.handleClick()}>
                                    <Icon icon={faHome} size="lg" fixedWidth/>
                                    <span className="ml-2 ml-lg-0">Home</span>
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className="nav-link" to="/dashboard/calendar"
                                         onClick={e => this.handleClick()}>
                                    <Icon icon={faCalendarAlt} size="lg" fixedWidth/>
                                    <span className="ml-2 ml-lg-0">Calendar</span>
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className="nav-link" to="/dashboard/services"
                                         onClick={e => this.handleClick()}>
                                    <Icon icon={faServer} size="lg" fixedWidth/>
                                    <span className="ml-2 ml-lg-0">Services</span>
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className="nav-link" to="/dashboard/staff" onClick={e => this.handleClick()}>
                                    <Icon icon={faUser} size="lg" fixedWidth/>
                                    <span className="ml-2 ml-lg-0">Staff</span>
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className="nav-link" to="/dashboard/customers"
                                         onClick={e => this.handleClick()}>
                                    <Icon icon={faUsers} size="lg" fixedWidth/>
                                    <span className="ml-2 ml-lg-0">Customers</span>
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className="nav-link" to="/dashboard/marketing"
                                         onClick={e => this.handleClick()}>
                                    <Icon icon={faBullhorn} size="lg" fixedWidth/>
                                    <span className="ml-2 ml-lg-0">Marketing</span>
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className="nav-link" to="/dashboard/quotes" onClick={e => this.handleClick()}>
                                    <Icon icon={faList} size="lg" fixedWidth/>
                                    <span className="ml-2 ml-lg-0">Quotes</span>
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className="nav-link" to="/dashboard/pos" onClick={e => this.handleClick()}>
                                    <Icon icon={faTags} size="lg" fixedWidth/>
                                    <span className="ml-2 ml-lg-0">POS</span>
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className="nav-link" to="/dashboard/reports"
                                         onClick={e => this.handleClick()}>
                                    <Icon icon={faFilePdf} size="lg" fixedWidth/>
                                    <span className="ml-2 ml-lg-0">Reports</span>
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className="nav-link" to="/dashboard/settings"
                                         onClick={e => this.handleClick()}>
                                    <Icon icon={faCog} size="lg" fixedWidth/>
                                    <span className="ml-2 ml-lg-0">Settings</span>
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className="nav-link" to="/dashboard/chat" onClick={e => this.handleClick()}>
                                    <Icon icon={faComments} size="lg" fixedWidth/>
                                    <span className="ml-2 ml-lg-0">Chat</span>
                                </NavLink>
                            </NavItem>
                            <NavItem className="d-lg-none">
                                <div className="d-flex justify-content-around text-white pt-3 pb-3 bg-dark">
                                    <Icon icon={faUser} size="lg"/>
                                    <Icon icon={faMobile} size="lg"/>
                                    <Icon icon={faPowerOff} onClick={() => this.logout()} size="lg"/>
                                </div>
                            </NavItem>
                        </Nav>
                    </Collapse>
                </Navbar>
            </div>,
            <div key="spacer" className="navigation-spacer"/>
        ]
    }
}

function mapState(state) {
    return {
        user: state.user
    }
}

function mapActions(dispatch) {
    return bindActionCreators({selectCompany}, dispatch);
}

export default withRouter(connect(mapState, mapActions)(Navigation))
