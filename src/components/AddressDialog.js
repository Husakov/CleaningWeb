import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import Geocode from './customers/ReactGeocode';
import GoogleMap from "./GoogleMap";
import {Marker} from "react-google-maps";

import { GOOGLE_MAPS_KEY } from "../config";

Geocode.setApiKey(GOOGLE_MAPS_KEY);

class AddressDialog extends Component {

    state = {
        mapCenter: { lat: 0, lng: 0 },
        displayedAddress: "",
        addressError:false
    }

    componentDidMount() {
        this.setAddress(this.props.address);
    }
    componentWillReceiveProps(newProps){
        if(this.props.address!==newProps.address)
            this.setAddress(newProps.address);
    }
    setAddress = async (address) => {
        const displayedAddress = address;
        this.setState({ displayedAddress, addressError: false });
        try {
            const response = await Geocode.fromAddress(displayedAddress);
            this.setState({ mapCenter: response.results[0].geometry.location })
        } catch (e) {

            this.setState({ addressError: true })
        }
    };
    render() {
        return (
            <Modal isOpen={this.props.isOpen} toggle={this.props.toggle} size="lg">
                <ModalHeader toggle={this.props.toggle}>
                    {this.props.address}
                </ModalHeader>
                <ModalBody>
                    <div style={{ opacity: this.state.addressError ? 0.2 : 1 }}>
                        <GoogleMap zoom={16} containerElement={<div style={{height: '500px', width: '100%'}}/>} center={this.state.mapCenter}>
                            <Marker position={this.state.mapCenter} />
                        </GoogleMap>
                    </div>
                </ModalBody>
            </Modal>
        )
    }
}

export default AddressDialog;