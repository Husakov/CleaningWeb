import React from 'react'
import {Button, Input, Popover, PopoverBody, PopoverHeader} from "reactstrap";
import './Note.css';
import moment from 'moment';
import {TIME_ZONE} from '../config';
import Icon from '@fortawesome/react-fontawesome'
import {faPencilAlt} from "@fortawesome/fontawesome-free-solid/shakable.es";

class Note extends React.Component {
    state = {
        popoverOpen: false,
        expanded: false,
        editClicked: false,
        note: this.props.note.note,
        noteLength: this.props.note.note.length
    };

    togglePopover() {
        this.setState({popoverOpen: !this.state.popoverOpen})
    }

    render() {
        const date = new Date(this.props.note.created_at + " " + TIME_ZONE);
        return (
            <div className="note-bubble">
                <div className="note-icons">
                    <span className="delete-note mr-1"
                          onClick={() => this.setState({editClicked: !this.state.editClicked})}
                    >
                        <Icon icon={faPencilAlt}/></span>
                    <span id={"delete-note" + this.props.note.id}
                          className="delete-note"
                          onClick={() => this.togglePopover()}>&#x2715;</span>
                </div>
                <Popover target={"delete-note" + this.props.note.id}
                         isOpen={this.state.popoverOpen}
                         toggle={() => this.togglePopover()}>
                    <PopoverHeader>Delete this Note?</PopoverHeader>
                    <PopoverBody className="d-flex justify-content-between note">
                        <Button color="danger"
                                onClick={() => {
                                    this.props.deleteNote(this.props.i, this.props.note.id);
                                    this.setState({popoverOpen: false})
                                }}>
                            Yes
                        </Button>
                        <Button color="secondary"
                                onClick={() => this.togglePopover()}>
                            Cancel
                        </Button>
                    </PopoverBody>
                </Popover>
                {this.state.editClicked ?
                    <div className="edit-note">
                        <Input type="textarea"
                               maxLength="190"
                               value={this.state.note}
                               onChange={(e) => this.setState({
                                   note: e.target.value,
                                   noteLength: e.target.value.length
                               })}/>
                        <div>
                            <span>{this.state.noteLength}/190</span>
                            <Button className="add-note-button"
                                    color="success"
                                    onClick={() => {
                                        this.props.editNote(this.props.i, this.props.note.id, {note: this.state.note});
                                        this.setState({editClicked: false})
                                    }}>Save</Button>
                        </div>
                    </div> :
                    <div>
                        {this.props.note.note.length <= 120 ? this.props.note.note :
                            this.state.expanded ? this.props.note.note : this.props.note.note.substr(0, 120) + "..."}
                        {!(this.props.note.note.length <= 120) && <p className="note-see-more"
                                                                     onClick={() => this.setState({expanded: !this.state.expanded})}>{this.state.expanded ? "Show less" : "Show more"}</p>}
                        <div className="note-details">
                            <p>Created
                                at: <span>{moment(date).format('MM/DD/YYYY') + " " + moment(date).format('h:mm A')}</span>
                            </p>
                            <p>Created by: <span>{this.props.note.user.name} {this.props.note.user.last_name}</span></p>
                        </div>
                    </div>}
            </div>

        )
    }
}

export default Note;
