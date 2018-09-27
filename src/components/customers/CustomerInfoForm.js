import React from 'react'
import PropTypes from 'prop-types'
import CustomerModel from "../../model/customer";
import {Col, FormFeedback, Label, Row} from "reactstrap";
import InputField from "../InputField";
import AvatarPickerDialog from "../AvatarPickerDialog";
import {connect} from "react-redux";
import {getAvatars} from "../../reducers/staffReducer";
import {bindActionCreators} from "redux";
import {faCamera} from "@fortawesome/fontawesome-free-solid/shakable.es";
import Icon from '@fortawesome/react-fontawesome'
import {getError} from "../../util";
import noUserImg from '../../user.png';

const reduceStaffUsers = (teams) => teams.filter(team => team.id > 0).reduce((arr, team) => {

    team.users.filter(u => u.active).forEach(user => arr.push(user));
    return arr;
}, []).map(user => ({value: user.id, label: user.name}));

const reduceStaffTeams = (teams) => teams.filter(team => team.id > 0).map(team => ({value: team.id, label: team.name}));

class CustomerInfoForm extends React.Component {

    state = {
        avatarPickerOpen: false
    };

    toggleAvatarPicker = () => {
        this.setState({avatarPickerOpen: !this.state.avatarPickerOpen})
    };
    handleImage = (image) => {
        let reader = new FileReader();
        reader.readAsDataURL(image);
        reader.onloadend = () => {
            this.props.handleFormInput("image", reader.result)
        };
        this.props.customer.imageFile = image;
    };

    componentDidMount() {
        if (this.props.avatars.length === 0)
            this.props.getAvatars()
    }

    error(name) {
        return getError(this.props.errors, name);
    }

    render() {
        const {handleFormInput, disabled} = this.props;
        return (
            <Row>
                <Col md={4}>
                    <Label>Avatar</Label>
                </Col>
                <Col md={8}>
                    <div className="position-relative d-inline-block">
                        <img src={this.props.customer.image ? this.props.customer.image : noUserImg}
                             onClick={this.toggleAvatarPicker}
                             alt="profile"
                             className="details-profile-image"/>
                        <Icon className="staff-camera-icon dialog-icon"
                              icon={faCamera}
                              onClick={this.toggleAvatarPicker}/>
                    </div>
                </Col>
                <Col md={8} className="offset-md-4 mb-2">
                    <FormFeedback>{this.error("image")}{this.error("imageurl")}</FormFeedback>
                </Col>
                <AvatarPickerDialog isOpen={this.state.avatarPickerOpen} toggle={this.toggleAvatarPicker}
                                    handleFormInput={handleFormInput} handleImage={this.handleImage}
                                    avatars={this.props.avatars}/>
                <InputField handleFormInput={handleFormInput} label="First Name" name="first_name"
                            value={this.props.customer.first_name} disabled={disabled}
                            type="text" error={this.error("first_name")} required/>
                <InputField handleFormInput={handleFormInput} label="Last Name" name="last_name"
                            value={this.props.customer.last_name} disabled={disabled}
                            type="text" error={this.error("last_name")} required/>
                <InputField handleFormInput={handleFormInput} label="E-Mail" name="email"
                            value={this.props.customer.email} disabled={disabled}
                            type="email" error={this.error("email")} required/>
                <InputField handleFormInput={handleFormInput} label="Password" name="password"
                            value={this.props.customer.password} disabled={disabled}
                            type="text" error={this.error("password")} required/>
                <InputField handleFormInput={handleFormInput} label="Main Phone" name="phone_number"
                            value={this.props.customer.phone_number} disabled={disabled}
                            prepend="+1" required
                            type="phone_number" error={this.error("phone_number")}/>
                <InputField handleFormInput={handleFormInput} label="Alternative Phone" name="alt_phone"
                            value={this.props.customer.alt_phone} disabled={disabled}
                            prepend="+1"
                            type="phone_number" error={this.error("alt_phone")}/>
                <InputField handleFormInput={handleFormInput} label="Date of Birth" name="date_of_birth"
                            value={this.props.customer.date_of_birth} disabled={disabled}
                            type="date" error={this.error("date_of_birth")}/>
                <InputField handleFormInput={handleFormInput} label="Address 1" name="address"
                            value={this.props.customer.address} disabled={disabled}
                            type="text" error={this.error("address")}/>
                <InputField handleFormInput={handleFormInput} label="Address 2" name="address2"
                            value={this.props.customer.address2} disabled={disabled}
                            type="text" error={this.error("address2")}/>
                <InputField handleFormInput={handleFormInput} label="City" name="city"
                            value={this.props.customer.city} disabled={disabled}
                            type="text" error={this.error("city")}/>
                <InputField handleFormInput={handleFormInput} label="Zip code" name="zip"
                            value={this.props.customer.zip} disabled={disabled}
                            type="text" error={this.error("zip")}/>
                <InputField handleFormInput={handleFormInput} label="Preferred Staff"
                            name="preferred_staff_ids"
                            options={reduceStaffUsers(this.props.staffList ? this.props.staffList : [])}
                            value={this.props.customer.preferred_staff_ids} disabled={disabled}
                            type="multi-select" error={this.error("preferred_staff_ids")}/>
                <InputField handleFormInput={handleFormInput} label="Preferred Teams"
                            name="preferred_team_ids"
                            options={reduceStaffTeams(this.props.staffList ? this.props.staffList : [])}
                            value={this.props.customer.preferred_team_ids} disabled={disabled}
                            type="multi-select" error={this.error("preferred_team_ids")}/>
                <InputField handleFormInput={handleFormInput} label="Customer Since" name="customer_since"
                            value={this.props.customer.customer_since} disabled={disabled}
                            type="date" error={this.error("customer_since")}/>
            </Row>
        )
    }
}

CustomerInfoForm.propTypes = {
    handleFormInput: PropTypes.func.isRequired,
    customer: PropTypes.instanceOf(CustomerModel).isRequired,
    disabled: PropTypes.bool.isRequired
};

function mapState(state) {
    return {avatars: state.staff.avatars}
}

function bindActions(dispatch) {
    return bindActionCreators({getAvatars}, dispatch)
}

export default connect(mapState, bindActions)(CustomerInfoForm);
