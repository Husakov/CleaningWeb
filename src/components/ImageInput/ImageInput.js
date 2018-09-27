import React from 'react'
import PropTypes from 'prop-types'
import './imageinput.css'
import empty from './empty_image.png'

class ImageInput extends React.Component {
    render() {
        const Props = {...this.props};
        let {className, value} = Props;
        value = value ? value : empty;
        className = className ? className : '';
        delete Props.className;
        delete Props.value;
        delete Props.id;
        return (
            <div className={"image-input " + className}>
                <img src={value} onClick={() => this.input.click()}/>
                <input {...Props} ref={e => this.input = e} type="file" accept="image/*"/>
            </div>
        );
    }
}

ImageInput.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
};

export default ImageInput;
