import React from 'react'
import {ChromePicker} from "react-color";

export class ColorPicker extends React.Component {
    state = {
        hover: false
    };

    timeout;

    togglePickerFocus(show) {
        if (show) {
            clearTimeout(this.timeout);
            this.setState({hover: show});
        } else {
            this.timeout = setTimeout(() => this.setState({hover: show}), 500)
        }
    }

    render() {
        const show = this.props.show;
        const propz = {...this.props};
        delete propz.show;
        return (
            (show || this.state.hover) &&
            <div onMouseEnter={() => this.togglePickerFocus(true)}
                 onMouseLeave={() => this.togglePickerFocus(false)}>
                <ChromePicker
                    {...propz}/>
            </div>
        )
    }
}
