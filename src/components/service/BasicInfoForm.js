import React from 'react'
import {Button, Col, FormFeedback, FormGroup, Input, Label, Row} from "reactstrap";
import Toggle from "../Toggle";
import PropTypes from 'prop-types'
import './basicinfoform.css'
import ImageInput from "../ImageInput/ImageInput";
import {faSync} from "@fortawesome/fontawesome-free-solid/shakable.es";
import Icon from '@fortawesome/react-fontawesome'
import {getError} from "../../util";
import {ColorPicker} from "../ColorPicker";

class BasicInfoForm extends React.Component {

    handleImage = (e) => {
        this.props.handleImage(e);
        let reader = new FileReader();
        const image = e.target.files[0];

        reader.readAsDataURL(image);

        reader.onloadend = () => {
            this.setState({
                preview: reader.result
            });
        }
    };

    constructor(props) {
        super(props);
        this.state = {
            pickerActive: false,
            pickerFocus: false,
            preview: props.service.image,
            onlineError: false
        };
    }

    togglePicker(show) {
        this.setState({pickerActive: show})
    }

    togglePickerFocus(show) {
        this.setState({pickerFocus: show})
    }

    error(name) {
        if (!this.props.error) return undefined;
        return getError(this.props.error.errors, name);
    }

    render() {
        return <Row>
            <Col md={4}>
                <Label for="colorTag">Color Tag<span className="text-danger">*</span></Label>
            </Col>
            <Col md={8}>
                <FormGroup>
                    <Input type="text"
                           disabled={this.props.disabled}
                           className="service-color-input"
                           name="colorTag" id="colorTag"
                           value={this.props.service.color}
                           readOnly
                           onFocus={() => this.togglePicker(true)}
                           onBlur={() => this.togglePicker(false)}/>
                    <div className="color-input-box" style={{background: this.props.service.color}}/>
                    <ColorPicker show={this.state.pickerActive}
                                 color={this.props.service.color}
                                 onChange={color => this.props.handleFormInput('color', color.hex)}/>
                </FormGroup>
            </Col>

            <Col md={4}>
                <Label for="title">Service Name<span className="text-danger">*</span></Label>
            </Col>
            <Col md={8}>
                <FormGroup>
                    <Input type="text"
                           disabled={this.props.disabled}
                           name="title" id="title"
                           value={this.props.service.name}
                           invalid={this.error("name")}
                           onChange={(e) => this.props.handleFormInput('name', e.target.value)}/>
                    <FormFeedback>{this.error("name")}</FormFeedback>
                </FormGroup>
            </Col>

            <Col md={4}>
                <Label for="desc">Service Description</Label>
            </Col>
            <Col md={8}>
                <FormGroup>
                    <Input type="textarea"
                           disabled={this.props.disabled}
                           name="desc" id="desc"
                           value={this.props.service.description}
                           invalid={this.error("description")}
                           onChange={(e) => this.props.handleFormInput('description', e.target.value)}/>
                    <FormFeedback>{this.error("description")}</FormFeedback>
                </FormGroup>
            </Col>

            <Col md={4}>
                <Label for="image">Service Image<span className="text-danger">*</span></Label>
            </Col>
            <Col className="mb-2" md={8}>
                <FormGroup>
                    <ImageInput type="file"
                                value={this.state.preview}
                                onChange={this.handleImage}
                                disabled={this.props.disabled}
                                accept="image/*"
                                invalid={this.error("image")}
                                name="image"/>
                    <FormFeedback>{this.error("image")}</FormFeedback>
                </FormGroup>
            </Col>

            <Col md={4}>
                <Label for="online">Online Booking</Label>
            </Col>
            <Col className="mb-2" md={8}>
                <FormGroup>
                    <Toggle
                        disabled={this.props.disabled}
                        value={this.props.service.online}
                        activeText="Enabled"
                        inactiveText="Disabled"
                        onClick={() => this.toggleOnline()}/>
                    <FormFeedback>{this.state.onlineError ? "Pricing must be added before service can be online" : ""}</FormFeedback>
                </FormGroup>
            </Col>
            <Col md={8} className="offset-md-4">
                <Button disabled={this.props.disabled} color="success" className="mr-2"
                        type="submit" onClick={this.props.saveService}>
                    {this.props.disabled ? <Icon spin icon={faSync}/> : ''}
                    Save Changes</Button>
                <Button disabled={this.props.disabled} color="danger"
                        onClick={this.props.restoreOldData}>Discard Changes</Button>
            </Col>
        </Row>
    }

    hasPricing() {
        if (this.props.service.pricings.length === 0)
            return false;
        let hasPricing = false;
        this.props.service.pricings.forEach(pricing => {
            pricing.rules.forEach(rule => {
                if (rule.value > 0) {
                    hasPricing = true;
                }
            })
        });
        return hasPricing;
    }

    toggleOnline() {
        if (this.hasPricing())
            this.props.handleFormInput('online', !this.props.service.online);
        else
            this.setState({onlineError: true})
    }
}

BasicInfoForm.propTypes = {
    handleFormInput: PropTypes.func.isRequired,
    handleImage: PropTypes.func.isRequired,
    service: PropTypes.object.isRequired,
    saveService: PropTypes.func.isRequired,
    restoreOldData: PropTypes.func.isRequired
};

export default BasicInfoForm
