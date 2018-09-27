import React from 'react'
import {
    faCalendarCheck,
    faEnvelope,
    faHome,
    faList,
    faLock,
    faMapMarkerAlt,
    faMobile,
    faPencilAlt,
    faUserCircle
} from "@fortawesome/fontawesome-free-solid/shakable";
import {
    Badge,
    Button,
    Col,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Input,
    Nav,
    NavItem,
    NavLink,
    Row,
    TabContent,
    Table,
    TabPane
} from "reactstrap";
import GoogleMap from "../GoogleMap";
import CreateCustomerDialog from "../../containers/CreateCustomerDialog";
import Icon from '@fortawesome/react-fontawesome'
import {Marker} from "react-google-maps";
import classSet from "react-classset";
import ContactPermissionsDialog from '../../containers/ContactPermissionsDialog'
import CountBubble from "../CountBubble";
import CustomerPropertyDialog from "../CustomerPropertyDialog";
import Geocode from './ReactGeocode';
import {GOOGLE_MAPS_KEY} from "../../config";
import {connect} from "react-redux";
import * as classnames from "classnames";
import {colorLuminance, formatNumber} from "../../util";
import {toast} from "react-toastify";
import CustomerQuotes from "./CustomerQuotes";
import CustomerAppointments from "./CustomerAppointments";

Geocode.setApiKey(GOOGLE_MAPS_KEY);


class CustomerDetails extends React.Component {

    state = {
        dropdownOpen: false,
        customerDialogOpen: false,
        permissionsDialogOpen: false,
        propertyDialogOpen: false,
        activeTab: 0,
        activeMapTab: 0,
        propertySelected: undefined,
        mapCenter: {lat: 0, lng: 0},
        displayedAddress: "",
        addressList: [],
        dropOpen: {}
    };

    toggle = () => {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen
        });
    };

    toggleCustomerDialog = () => {
        this.setState({customerDialogOpen: !this.state.customerDialogOpen})
    };

    togglePermissionsDialog = () => {
        this.setState({permissionsDialogOpen: !this.state.permissionsDialogOpen})
    };

    togglePropertyDialog = (property) => {
        this.setState({propertySelected: property, propertyDialogOpen: !this.state.propertyDialogOpen})
    };
    savePermissions = async permissions => {
        await this.props.savePermissions(permissions);
        this.togglePermissionsDialog();
    };
    saveProperties = async (properties) => {
        const propsToRemove = this.props.customer.properties.filter(p => properties.findIndex(pr => p.id === pr.id) === -1);
        for (let i = 0; i < properties.length; i++) {
            await this.props.saveProperty(properties[i]);
        }
        for (let i = 0; i < propsToRemove.length; i++) {
            await this.props.removeProperty(propsToRemove[i]);
        }
        this.togglePropertyDialog();
        this.computePropertyList();
        toast.success("Properties updated!");
    };
    selectAddress = async (address) => {
        const displayedAddress = address;
        this.setState({displayedAddress, addressError: false});
        try {
            const response = await Geocode.fromAddress(displayedAddress);
            this.setState({mapCenter: response.results[0].geometry.location})
        } catch (e) {

            this.setState({addressError: true})
        }
    };

    toggleTab(pos) {
        this.setState({activeTab: pos})
    }

    componentDidUpdate(prevProps) {
        if (prevProps.customer.address !== this.props.customer.address
            || prevProps.customer.address2 !== this.props.customer.address2
            || prevProps.customer.city !== this.props.customer.city) {
            this.computePropertyList();
        }
    }

    componentDidMount() {
        this.computePropertyList()
    }

    computePropertyList() {
        const addressList = [];
        if (this.props.customer.address)
            addressList.push(this.props.customer.address + ", " + this.props.customer.city);
        if (this.props.customer.address2)
            addressList.push(this.props.customer.address2 + ", " + this.props.customer.city);
        this.props.customer.properties.forEach(property => {
            addressList.push(property.name);
        });
        if (addressList.length > 0) {
            this.selectAddress(addressList[0])
        }
        this.setState({addressList});
    }

    render() {
        const {customer, permissions, users, teams} = this.props;
        return (
            <Col md={8} className="border-right p-3">
                <h3 className="border-bottom mb-0 pb-3">{`${customer.first_name} ${customer.last_name}`}</h3>
                <Row className="pt-3 m-0">
                    <Col sm={3} className="d-flex p-0 align-items-center flex-column">
                        <img src={customer.image} alt="" width="130" height="130"/>
                        <Dropdown className="mt-2" isOpen={this.state.dropdownOpen} toggle={this.toggle}>
                            <DropdownToggle color="success" caret>
                                Actions
                            </DropdownToggle>
                            <DropdownMenu>
                                <DropdownItem onClick={this.toggleCustomerDialog}>
                                    <Icon icon={faPencilAlt} fixedWidth/> Edit
                                </DropdownItem>
                                <DropdownItem onClick={this.togglePermissionsDialog}>
                                    <Icon icon={faLock} fixedWidth/> Contact Permissions
                                </DropdownItem>
                                <DropdownItem onClick={() => this.togglePropertyDialog()}>
                                    <Icon icon={faHome} fixedWidth/> Properties
                                </DropdownItem>
                                <DropdownItem divider/>
                                <DropdownItem><Icon icon={faCalendarCheck} fixedWidth/> Add Appointment</DropdownItem>
                                <DropdownItem><Icon icon={faList} fixedWidth/> Add Quote</DropdownItem>
                                <DropdownItem divider/>
                                <DropdownItem><Icon icon={faEnvelope} fixedWidth/> Send E-Mail</DropdownItem>
                                <DropdownItem><Icon icon={faMobile} fixedWidth/> Send Text Message</DropdownItem>
                                <DropdownItem divider/>
                                <DropdownItem><Icon icon={faEnvelope} fixedWidth/> Send Login Info</DropdownItem>
                                <DropdownItem><Icon icon={faUserCircle} fixedWidth/> Login as Client</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </Col>
                    <Col sm={9} className="p-0">
                        <Table bordered>
                            <thead>
                            <tr>
                                <th>Total Revenue</th>
                                <th>Total Paid</th>
                                <th>Due Amount</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>$50.00</td>
                                <td className="text-success">$45.00</td>
                                <td className="text-danger">$5.00</td>
                            </tr>
                            </tbody>
                        </Table>
                        <h5>Customer hub last active: Never</h5>
                        <h5>Preferred staff: {customer.preferred_staff_ids
                            .map(id => users.find(u => u.id === id))
                            .map((user) => user &&
                                <Badge className="mr-1" style={{background: "#545B62"}}>{user.name}</Badge>)
                        }</h5>
                        <h5>Preferred teams: {customer.preferred_team_ids
                            .map(id => teams.find(u => u.id === id))
                            .map((team) => team && <Badge className={classnames({
                                "mr-1": true,
                                "text-dark": colorLuminance(team.color) > 0.5
                            })} style={{background: team.color}}>{team.name}</Badge>)
                        }</h5>
                        <h5>Customer since: {customer.customer_since.format("MM/DD/YYYY")}</h5>
                    </Col>
                </Row>
                <Nav tabs className="mt-2">
                    <NavItem>
                        <NavLink className={classSet({active: this.state.activeTab === 0})}
                                 onClick={() => this.toggleTab(0)}>Details</NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink className={classSet({active: this.state.activeTab === 1})}
                                 onClick={() => this.toggleTab(1)}>Appointments</NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink className={classSet({active: this.state.activeTab === 2})}
                                 onClick={() => this.toggleTab(2)}>Campaigns</NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink className={classSet({active: this.state.activeTab === 3})}
                                 onClick={() => this.toggleTab(3)}>Requests</NavLink>
                        <CountBubble>3</CountBubble>
                    </NavItem>
                    <NavItem>
                        <NavLink className={classSet({active: this.state.activeTab === 4})}
                                 onClick={() => this.toggleTab(4)}>Message History</NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink className={classSet({active: this.state.activeTab === 5})}
                                 onClick={() => this.toggleTab(5)}>Quotes</NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink className={classSet({active: this.state.activeTab === 6})}
                                 onClick={() => this.toggleTab(6)}>Customer Log</NavLink>
                    </NavItem>
                </Nav>
                <TabContent activeTab={this.state.activeTab}>
                    <TabPane tabId={0}>
                        <Row className="py-3">
                            <Col sm={6} className="px-4 d-flex flex-column justify-content-around">
                                <h5><Icon icon={faMobile}
                                          fixedWidth/> {formatNumber(customer.phone_number)}</h5>
                                <h5 className="d-flex align-items-center">
                                    <Icon icon={faMapMarkerAlt} fixedWidth/>
                                    <Input type="select"
                                           value={this.state.displayedAddress}
                                           onChange={e => this.selectAddress(e.target.value)}
                                           className="ml-1">
                                        {this.state.addressList.map(addr =>
                                            <option key={addr} value={addr}>{addr}</option>
                                        )}
                                    </Input>
                                </h5>
                                <h5><Icon icon={faEnvelope} fixedWidth/> {customer.email}</h5>
                            </Col>
                            <Col sm={6}>
                                <div style={{opacity: this.state.addressError ? 0.2 : 1}}>
                                    <GoogleMap zoom={16}
                                               containerElement={<div style={{height: '200px', width: '100%'}}/>}
                                               center={this.state.mapCenter}>
                                        <Marker position={this.state.mapCenter}/>
                                    </GoogleMap>
                                </div>
                                {this.state.addressError &&
                                <h5 className="map-error-container">
                                    GeoCoding failed for selected address
                                </h5>}
                            </Col>
                        </Row>
                    </TabPane>
                    <TabPane tabId={1}>
                        <h5 className="mt-3">Upcoming Appointments</h5>
                        <CustomerAppointments customer={this.props.customer}/>


                    </TabPane>
                    <TabPane tabId={2}>

                    </TabPane>
                    <TabPane tabId={3}>

                        <Button color="success" className="my-3">Add new request</Button>
                        <Table bordered>
                            <thead>
                            <tr>
                                <th>Id</th>
                                <th>Type</th>
                                <th>Message</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>#1</td>
                                <td>Info</td>
                                <td>Lorem ipsum dolor sit amet.</td>
                                <td>Open</td>
                                <td><Button color="primary">Close</Button></td>
                            </tr>
                            <tr>
                                <td>#2</td>
                                <td>Complaint</td>
                                <td>Lorem ipsum dolor sit amet.</td>
                                <td>Resolved</td>
                                <td><Button color="link">Close</Button></td>
                            </tr>
                            <tr>
                                <td>#3</td>
                                <td>Info</td>
                                <td>Lorem ipsum dolor sit amet.</td>
                                <td>Open</td>
                                <td><Button color="link">Close</Button></td>
                            </tr>
                            </tbody>
                        </Table>
                    </TabPane>
                    <TabPane tabId={4}>

                    </TabPane>
                    <TabPane tabId={5}>
                        <CustomerQuotes
                            customer={this.props.customer}/>
                    </TabPane>
                    <TabPane tabId={6}>
                        <Table bordered>
                            <thead>
                            <tr>
                                <th>Category</th>
                                <th>Action</th>
                                <th>Timestamp</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>Authentication</td>
                                <td>Login</td>
                                <td>03/14/2018 08:00 AM</td>
                            </tr>
                            <tr>
                                <td>Action</td>
                                <td>Create request #1</td>
                                <td>01/14/2018 02:00 PM</td>
                            </tr>
                            </tbody>
                        </Table>
                    </TabPane>
                </TabContent>
                <CreateCustomerDialog isOpen={this.state.customerDialogOpen}
                                      toggle={this.toggleCustomerDialog}
                                      customer={customer}/>
                <ContactPermissionsDialog isOpen={this.state.permissionsDialogOpen}
                                          toggle={this.togglePermissionsDialog}
                                          customer={customer}
                                          permissions={permissions}
                                          savePermissions={this.savePermissions}/>
                <CustomerPropertyDialog property={this.state.propertySelected}
                                        customer={customer}
                                        isOpen={this.state.propertyDialogOpen}
                                        toggle={this.togglePropertyDialog}
                                        saveProperties={this.saveProperties}/>
            </Col>
        )
    }
}

const reduceStaffUsers = (teams) => teams.filter(team => team.id > 0).reduce((arr, team) => {

    team.users.filter(u => u.active).forEach(user => arr.push(user));
    return arr;
}, []);

const reduceStaffTeams = (teams) => teams.filter(team => team.id > 0);

function mapState(state) {
    return {
        users: reduceStaffUsers(state.staff.staff),
        teams: reduceStaffTeams(state.staff.staff)
    }
}

export default connect(mapState)(CustomerDetails);