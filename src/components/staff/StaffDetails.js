import React, {Component} from 'react';
import {
    Alert,
    Button,
    Col,
    Nav,
    NavItem,
    NavLink,
    Popover,
    PopoverBody,
    PopoverHeader,
    TabContent,
    TabPane
} from "reactstrap";
import Icon from '@fortawesome/react-fontawesome'
import {faSync, faTrashAlt} from '@fortawesome/fontawesome-free-solid/shakable.es';
import classSet from 'react-classset'
import './Staff.css';
import StaffModel from '../../model/staff';
import scrollToElement from 'scroll-to-element'

import Details from './Details';
import Services from './Services';
import {toast} from "react-toastify";
import OffTime from './OffTime';

function setDeepProp(obj, value, fields) {
    if (fields.length === 1) {
        obj[fields[0]] = value;
        return;
    }
    const prop = fields[0];
    fields.splice(0, 1);

    if (prop.indexOf('[]') !== -1) {
        return setDeepProp(obj[prop.substr(0, prop.length - 2)][0], value, fields)
    }
    return setDeepProp(obj[prop], value, fields);
}

class StaffDetails extends Component {
    handleImage = (e) => {
        const staff = this.state.staff;
        let reader = new FileReader();
        const image = e.target.files[0];
        reader.readAsDataURL(image);
        reader.onloadend = () => {
            staff.image = reader.result;
        };
        staff.imageFile = e.target.files[0];
        this.setState({staff});
    };

    constructor(props) {
        super(props);
        this.state = {
            activeTab: 1,
            staff: new StaffModel(),
            alertVisible: false,
            errorVisible: false,
            popoverOpen: false
        }
    }

    componentWillReceiveProps(newProps) {
        if (this.props.selectedStaff.id !== newProps.selectedStaff.id) {
            if (newProps.selectedStaff.phone_number)
                newProps.selectedStaff.phone_number = newProps.selectedStaff.phone_number.slice(2);
            this.setState({
                staff: new StaffModel(newProps.selectedStaff),
                alertVisible: false,
                errorVisible: false,
                activeTab: 1
            })
            scrollToElement('.staff-details');
        }
        if (this.props.created.fulfilled !== newProps.created.fulfilled &&
            newProps.created.fulfilled) {
            const staff = new StaffModel()
            this.setState({staff: staff, alertVisible: false, errorVisible: false})
        }
        if (this.props.createUser !== newProps.createUser && newProps.createUser) {
            const staff = new StaffModel()
            this.setState({staff: staff, alertVisible: false, errorVisible: false, activeTab: 1})
            scrollToElement('.staff-details');
        }

        if ((newProps.created.fulfilled && this.props.created.fulfilled !== newProps.created.fulfilled) ||
            (newProps.edited.fulfilled && this.props.edited.fulfilled !== newProps.edited.fulfilled))
            toast.success(this.props.createUser ? "User Created" : "User Edited");
        if ((newProps.created.error && this.props.created.error !== newProps.created.error) ||
            (newProps.edited.error && this.props.edited.error !== newProps.edited.error))
            this.setState({errorVisible: true})

    }

    handleFormInput(field, data) {
        const staff = this.state.staff;
        if (field.indexOf(".") !== -1) {
            let fields = field.split(".");
            setDeepProp(staff, data, fields);
        } else {
            staff[field] = data;
        }
        this.setState({staff})
    }

    create() {
        let staff = this.state.staff;
        let phone = this.state.staff.phone_number;
        if (phone) {
            phone = phone.split("");
            for (let j = 0; j < phone.length; j++) {
                if (phone[j] === " " || phone[j] === "-")
                    phone[j] = ""
            }
            phone = phone.join("");
        }
        staff.phone_number = phone;
        staff.company_id = this.props.user.selectedCompany.id;
        staff.email = staff.email && staff.email.length > 0 ? staff.email : undefined;
        staff.password = staff.password && staff.password.length > 0 ? staff.password : undefined;
        this.props.create(staff.serialize());
    }

    save() {
        let edited = this.props.selectedStaff.getDiff(this.state.staff);
        edited.imageFile = this.state.staff.imageFile;
        let phone = edited.phone_number;
        if (phone) {
            phone = phone.split("");
            for (let j = 0; j < phone.length; j++) {
                if (phone[j] === " " || phone[j] === "-")
                    phone[j] = ""
            }
            phone = phone.join("");
            phone = "+1" + phone;
        }

        edited.phone_number = phone;
        this.props.editStaff(edited.serialize(), this.props.selectedStaff.id);
    }

    togglePopover() {
        this.setState({popoverOpen: !this.state.popoverOpen})
    }

    render() {
        return (
            <div className="container">
                <div className="staff-details-header">
                    <h4>{this.props.createUser ? "Create New User" : this.props.selectedStaff.name}</h4>
                    {!this.props.createUser &&
                    <div>
                        <Popover target='delete-button' isOpen={this.state.popoverOpen}
                                 toggle={() => this.togglePopover()}>
                            <PopoverHeader>Delete this Staff?</PopoverHeader>
                            <PopoverBody className="d-flex justify-content-between">
                                <Button color="danger"
                                        onClick={() => {
                                            this.props.deleteStaff(this.props.selectedStaff.id)
                                            this.togglePopover()
                                        }}>
                                    Yes
                                </Button>
                                <Button color="secondary"
                                        onClick={() => this.togglePopover()}>
                                    Cancel
                                </Button>
                            </PopoverBody>
                        </Popover>
                        <Button
                            id='delete-button'
                            onClick={() => this.togglePopover()}
                            color="danger">
                            <Icon icon={faTrashAlt}/>
                        </Button>
                    </div>}
                </div>
                <Nav tabs className="mt-3">
                    <NavItem className="details-tab">
                        <NavLink className={classSet({active: this.state.activeTab === 1})}
                                 onClick={() => this.setState({activeTab: 1})}>Details</NavLink>
                    </NavItem>
                    {!this.props.createUser && <NavItem className="details-tab">
                        <NavLink className={classSet({active: this.state.activeTab === 2})}
                                 onClick={() => this.setState({activeTab: 2})}>Services</NavLink>
                    </NavItem>}

                    {!this.props.createUser && <NavItem className="details-tab">
                        <NavLink className={classSet({active: this.state.activeTab === 3})}
                                 onClick={() => this.setState({activeTab: 3})}>Off Time</NavLink>
                    </NavItem>}
                </Nav>
                <TabContent activeTab={this.state.activeTab} className="staff-details-content">
                    <TabPane tabId={1}>
                        <Details
                            errors={this.props.errors}
                            teams={this.props.teams}
                            user={this.state.staff}
                            roles={this.props.roles}
                            handleFormInput={(field, data) => this.handleFormInput(field, data)}
                            avatars={this.props.avatars}
                            handleImage={(e) => this.handleImage(e)}/>
                    </TabPane>
                    <TabPane tabId={2}>
                        <Services
                            staff={this.props.selectedStaff}
                            staff_id={this.props.selectedStaff.id}
                            toggleService={(staff_id, service_id, staff) => this.props.toggleService(staff_id, service_id, staff)}
                            services={this.props.services}
                        />
                    </TabPane>
                    <TabPane tabId={3}>
                        {this.props.selectedStaff.id && <OffTime
                            selectedStaffTimetable={this.props.selectedStaffTimetable}
                            offtime={this.props.offtime}
                            offtimes={this.props.offtimes}
                            selectedStaff={this.props.selectedStaff}
                            createOffTime={this.props.createOffTime}
                            editOffTime={this.props.editOffTime}
                            deleteOffTime={this.props.deleteOffTime}
                            deleteAllOffTime={this.props.deleteAllOffTime}
                            repeatOffTime={this.props.repeatOffTime}
                            getOffDates={this.props.getOffDates}
                            getCompanyOffDays={this.props.getCompanyOffDays}
                            getTeamOffDays={this.props.getTeamOffDays}
                            getUserOffDays={this.props.getUserOffDays}
                        />}
                    </TabPane>
                </TabContent>
                {this.state.activeTab === 1 &&
                <Col md={{size: 4, offset: 4}}>
                    <Button color="success"
                            disabled={this.props.created.pending || this.props.edited.pending}
                            onClick={() => {
                                this.props.createUser ? this.create() : this.save()
                            }}
                            style={{width: '100%'}}>
                        {this.props.edited.pending || this.props.created.pending ? <Icon spin icon={faSync}/> : null}
                        {this.props.createUser ? "Create" : "Save Changes"}
                    </Button>
                </Col>}

                <Alert color="success" isOpen={this.state.alertVisible}
                       toggle={() => this.setState({alertVisible: false})}>
                    {this.props.createUser ? "User Created" : "User Edited"}
                </Alert>
            </div>
        );
    }
}

export default StaffDetails;
