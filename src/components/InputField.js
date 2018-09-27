import {Col, FormFeedback, Input, InputGroup, InputGroupAddon, Label} from "reactstrap";
import React from "react";
import DatePicker from "react-datepicker";
import ReactSelect from '@kemoke/react-select';
import Toggle from "./Toggle";
import moment from "moment";

export const InputField = ({
                               handleFormInput, label, name, value = "", disabled, type, required = undefined,
                               children = null, prepend = null, append = null, error, colRatio = "4:8", options = [],
                               inject = null, maxLength = undefined, marginBottom = "2", placeholder, labelVisible = true
                           }) => [
    <Col key="label" className='d-flex align-items-center ' md={colRatio.split(":")[0]}>
        <Label for={name} className="mb-md-0">{label}{required && <span className="text-danger">*</span>}</Label>
    </Col>,
    <Col key="input" md={colRatio.split(":")[1]} className="d-flex input-row">
        {type === "time" ? [
                <InputGroup key="h">
                    <InputGroupAddon addonType="prepend">H</InputGroupAddon>
                    <Input type="number"
                           disabled={disabled}
                           placeholder="Hours"
                           value={~~(value / 60) === 0 ? '' : ~~(value / 60)}
                           onChange={e => handleFormInput(name, e.target.value, "hour")}/>
                </InputGroup>,
                <InputGroup key="m">
                    <InputGroupAddon addonType="prepend">M</InputGroupAddon>
                    <Input type="number"
                           disabled={disabled}
                           placeholder="Minutes"
                           value={~~(value % 60) === 0 ? '' : ~~(value % 60)}
                           onChange={e => handleFormInput(name, e.target.value, "minute")}/>
                </InputGroup>
            ] :
            <InputGroup>
                {prepend && <InputGroupAddon addonType="prepend">{prepend}</InputGroupAddon>}
                {type === "date" ?
                    <DatePicker selected={moment(value)} onChange={date => handleFormInput(name, date)}
                                className="form-control" required={required}/>
                    : type === "toggle" ?
                        <Toggle activeText="Enabled"
                                inactiveText="Disabled"
                                value={value}
                                onClick={() => handleFormInput(name, !value)}
                                name={name} id={name}/>
                        : type === "multi-select" ?
                            <ReactSelect name={name}
                                         value={value}
                                         multi={true}
                                         options={options}
                                         onChange={options => handleFormInput(name, options.map(opt => opt.value))}/>
                            :
                            <Input type={type}
                                   disabled={disabled}
                                   name={name} id={name}
                                   value={value}
                                   invalid={error}
                                   required={required}
                                   maxLength={maxLength}
                                   placeholder={placeholder}
                                   onChange={(e) => handleFormInput(name, e.target.value)}>{children}</Input>
                }
                {append && <InputGroupAddon addonType="append">{append}</InputGroupAddon>}
            </InputGroup>
        }
        {inject && inject}
    </Col>,
    <Col key="error" md={8} className={`offset-md-4 mb-${marginBottom}`}><FormFeedback>{error}</FormFeedback></Col>
];

export default InputField;
