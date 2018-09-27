import React from 'react'
import {Button, Col, Form, Input} from "reactstrap";
import withDragDropContext from "../../dnd-context";
import './CustomerSidebar.css';
import Note from '../Note'

import {customer as customerapi} from '../../api'

class CustomerSidebar extends React.Component {
    state = {
        labels: [],
        label: "",
        notes: [],
        note: "",
        noteLength: 0,
        popoverOpen: false
    };

    async componentDidMount() {

        const notes = this.props.customer.notes;
        const labels = this.props.customer.labels;
        this.setState({notes: notes, labels: labels});
    }

    async addNote() {
        const note = await customerapi.createNote(this.props.customer.id, this.state.note);
        const notes = [...this.state.notes];
        notes.push(note);
        this.setState({notes: notes, note: "", noteLength: 0})
    }

    async addLabel(e) {
        e.preventDefault();
        const label = await customerapi.createLabel(this.props.customer.id, this.state.label);
        const labels = [...this.state.labels];
        labels.push(label);
        this.setState({labels: labels, label: ""})
    }

    async deleteLabel(id, index) {
        await customerapi.deleteLabel(this.props.customer.id, id);
        const labels = [...this.state.labels];
        labels.splice(index, 1);
        this.setState({labels});
    }

    async deleteNote(index, id) {
        await customerapi.deleteNote(this.props.customer.id, id);
        const notes = [...this.state.notes];
        notes.splice(index, 1);
        this.setState({notes});
    }

    async editNote(index, id, note) {

        note = await customerapi.editNote(this.props.customer.id, id, note);
        const notes = [...this.state.notes];
        notes[index] = note;
        this.setState({notes});
    }

    handleTagAddition(tag) {
        const {tags} = this.state;
        this.setState({tags: [...tags, ...[tag]]});
    }

    handleTagDelete(i) {
        const {tags} = this.state;
        this.setState({
            tags: tags.filter((tag, index) => index !== i),
        });
    }

    togglePopover() {
        this.setState({popoverOpen: !this.state.popoverOpen})
    }

    render() {
        return (
            <Col md={4} className="customer-sidebar p-3">
                <h3 className="border-bottom mb-2 pb-3">Tags</h3>
                <div className="tags-wrapper">
                    <Form className="add-tag" onSubmit={(e) => this.addLabel(e)}>
                        <Input
                            className="tag-input"
                            value={this.state.label}
                            maxLength="16"
                            onChange={(e) => this.setState({label: e.target.value})}
                        />
                        <Button color="success"
                                disabled={!(this.state.label.length > 0)}
                                type="submit"
                                className="add-tag-button">Add Tag</Button>
                    </Form>
                    <div className="tags">
                        {this.state.labels.map((label, index) => {
                            return (
                                <div className="tag" key={label.id}>
                                    <span
                                        onClick={() => this.deleteLabel(label.id, index)}
                                        className="delete-label"
                                    >&#x2715;</span>
                                    {label.name}
                                </div>
                            )
                        })}
                    </div>
                </div>
                <h3 className="border-bottom mt-2 mb-2 pb-3">Notes</h3>
                <Input type="textarea"
                       value={this.state.note}
                       maxLength="190"
                       onChange={(e) => {
                           this.setState({note: e.target.value, noteLength: e.target.value.length})
                       }}/>
                <div>
                    <span>{this.state.noteLength}/190</span>
                    <Button className="add-note-button"
                            color="success"
                            disabled={!(this.state.note.length > 0)}
                            onClick={() => this.addNote()}>Add note</Button>
                </div>
                <div className="notes">
                    {this.state.notes.map((note, i) => {
                        return (
                            <Note note={note}
                                  i={i}
                                  key={note.id}
                                  editNote={(i, id, note) => this.editNote(i, id, note)}
                                  deleteNote={(i, id) => this.deleteNote(i, id)}/>
                        )
                    })}
                </div>
            </Col>
        )
    }
}

export default withDragDropContext(CustomerSidebar)
