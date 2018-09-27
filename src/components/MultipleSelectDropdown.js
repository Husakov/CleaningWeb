import React from 'react';
import {Dropdown, DropdownMenu, DropdownToggle} from "reactstrap";
import './MultipleSelectDropdown.css';

class MultipleSelectDropdown extends React.Component {
    state = {
        dropdown: false,
    };

    render() {
        const {title, color} = this.props;
        return (
            <div>
                <Dropdown
                    className="mb-2"
                    isOpen={this.state.dropdownOpen}
                    toggle={() => this.setState({dropdownOpen: !this.state.dropdownOpen})}>
                    <DropdownToggle
                        color={color}
                        caret>
                        {title}
                    </DropdownToggle>
                    <DropdownMenu className="pb-0">
                        {this.props.items.map((item, i) => {
                            return (
                                <label key={item.id} className="services-dropdown  mb-0">
                                    <input type="checkbox"
                                           onChange={() => this.props.toggle(item)}
                                           value={item.checked}
                                           checked={item.checked}
                                    />&nbsp;<span>{item.name}</span>
                                </label>
                            )
                        })}
                    </DropdownMenu>
                </Dropdown>
            </div>
        )
    }
}

export default MultipleSelectDropdown
