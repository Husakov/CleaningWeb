import React, {Fragment} from 'react'
import {Button, Col, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row} from "reactstrap";
import PropertyModel from "../model/property";
import PlacesAutoComplete, {geocodeByAddress, getLatLng} from 'react-places-autocomplete';
import {faPlus, faTrash} from "@fortawesome/fontawesome-free-solid/shakable.es";
import Icon from '@fortawesome/react-fontawesome';
import GoogleMap from "./GoogleMap";
import {Marker} from "react-google-maps";

class CustomerPropertyDialog extends React.Component {

    handleFormInput = (idx, prop, value) => {
        const {properties} = this.state;
        properties[idx] = new PropertyModel(this.state.property);
        properties[idx][prop] = value;
        this.setState({properties});
    };

    constructor(props) {
        super(props);
        this.state = {
            properties: props.customer.properties.map(p => new PropertyModel(p)),
            mapCenter: {lat: 0, lng: 0}
        }
    }

    addNewProperty() {
        const {properties} = this.state;
        properties.push(new PropertyModel(this.props.customer.id));
        this.setState({properties});
    }

    async setMapCenter(addr) {
        try {
            const response = await geocodeByAddress(addr);
            const latLng = await getLatLng(response[0]);
            this.setState({mapCenter: latLng})
        } catch (e) {

        }
    }

    deleteProperty(pos) {
        const {properties} = this.state;
        properties.splice(pos, 1);
        this.setState({properties});
    }

    render() {
        return (
            <Modal isOpen={this.props.isOpen} toggle={this.props.toggle}>
                <ModalHeader toggle={this.props.toggle}>
                    Your Properties
                </ModalHeader>
                <ModalBody className="pb-0">
                    {this.state.properties.map((property, i) =>
                        <Row className="position-relative" key={i}>
                            <Col md={2} className="d-flex align-items-center">
                                <Label for="address">Address</Label>
                            </Col>
                            <PlacesAutoComplete
                                value={property.name}
                                onChange={addr => this.handleFormInput(i, "name", addr)}
                                onSelect={addr => this.setMapCenter(addr)}>
                                {({getInputProps, suggestions, getSuggestionItemProps}) => (
                                    <Fragment>
                                        <Col md={10} className="mb-3 d-inline-flex">
                                            <Input {...getInputProps()} onFocus={() => this.setMapCenter(property.name)}
                                                   name="address"/>
                                            <Button color="danger" className="ml-2"
                                                    onClick={() => this.deleteProperty(i)}><Icon
                                                icon={faTrash}/></Button>
                                        </Col>
                                        <div className="autocomplete-dropdown-container">
                                            {suggestions.map(suggestion => {
                                                const className = suggestion.active ? 'suggestion-item active' : 'suggestion-item';
                                                // inline style for demonstration purpose
                                                const style = suggestion.active
                                                    ? {backgroundColor: '#fafafa', cursor: 'pointer'}
                                                    : {backgroundColor: '#ffffff', cursor: 'pointer'};
                                                return (
                                                    <div {...getSuggestionItemProps(suggestion, {className, style})}>
                                                        <span>{suggestion.description}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </Fragment>
                                )}
                            </PlacesAutoComplete>
                        </Row>
                    )}
                    <Row className="pb-3">
                        <Col className="d-flex justify-content-end" xs={12}>
                            <Button color="success" onClick={() => this.addNewProperty()}><Icon icon={faPlus}/> Add
                                property</Button>
                        </Col>
                    </Row>
                    <Row className="border-top">
                        <GoogleMap center={this.state.mapCenter} containerElement={<div style={{height: '200px', width: '100%'}}/>} zoom={17}>
                            <Marker position={this.state.mapCenter}/>
                        </GoogleMap>
                    </Row>
                </ModalBody>
                <ModalFooter>
                    <Button color="success"
                            onClick={() => this.props.saveProperties(this.state.properties)}>Save</Button>
                </ModalFooter>
            </Modal>
        )
    }
}


export default CustomerPropertyDialog;
