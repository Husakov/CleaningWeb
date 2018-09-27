import React from 'react'
import PropTypes from 'prop-types'
import classSet from 'react-classset'

import './Toggle.css'

const Toggle = (props) => (
    <div className={classSet({
        "toggle-container": true,
        "active": props.value,
        [props.className]: true
    })} onClick={props.onClick}>
        <div className="slider-body">
            <span>{props.activeText}</span>
            <div className="slider-head"/>
        </div>
        <span>{props.inactiveText}</span>
    </div>
);

Toggle.propTypes = {
    className: PropTypes.string,
    activeText: PropTypes.string.isRequired,
    inactiveText: PropTypes.string.isRequired,
    value: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired
};

export default Toggle