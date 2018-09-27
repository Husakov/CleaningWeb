import React from 'react'
import {compose, withProps} from "recompose"
import {GoogleMap, withGoogleMap, withScriptjs} from "react-google-maps";
import {GOOGLE_MAPS_KEY} from "../config";

const map = (props) => (
    <GoogleMap defaultZoom={props.zoom}
               center={props.center}
               onClick={props.onClick}
               defaultStreetView={props.defaultStreetView}
               containerElement={props.containerElement}
               style={props.style}>
        {props.children}
    </GoogleMap>
);

export default compose(
    withProps({
        googleMapURL: `https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=${GOOGLE_MAPS_KEY}`,
        loadingElement: <div style={{height: '100%', width: '100%'}}/>,
        //containerElement: <div style={{height: '200px', width: '100%'}}/>,
        mapElement: <div style={{height: '100%', width: '100%'}}/>,
    }),
    withScriptjs,
    withGoogleMap
)(map);
