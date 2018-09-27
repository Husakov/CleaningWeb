import React, {Component} from 'react';
import { ListGroup, ListGroupItem, ListGroupItemHeading, ListGroupItemText, InputGroup, Input, InputGroupAddon, Button, InputGroupText } from 'reactstrap';
import Icon from '@fortawesome/react-fontawesome'
import { faSearch } from "@fortawesome/fontawesome-free-solid/shakable.es";
import './Chat.css';
import moment from 'moment'

class Chats extends Component {
    constructor(props) {
        super(props);
        this.state = {
            search: ''
        }
    }

    activateChat = (id) => {
        this.props.onSelectChat(id)
    }
    
    onInputChange = (evt) => {
        this.setState({
            search: evt.target.value
        })
    }

    render() {
        return (
            <div className="chats-list">
                <div className="action-buttons d-flex justify-content-between p-2">
                    <Button color="info" onClick={this.newMessage}>New Message</Button>
                    <span>
                        <InputGroup>
                            <Input value={this.state.search} onChange={this.onInputChange}/>
                            <InputGroupAddon addonType="append">
                                <InputGroupText><Icon icon={faSearch} size="sm" fixedWidth/></InputGroupText>
                            </InputGroupAddon>
                        </InputGroup>
                    </span>
                </div>
                <ListGroup className="p-2">
                    {this.props.chats.filter(chat => chat.messages).filter(chat => chat.first_name.toLowerCase().indexOf(this.state.search) > -1).map((chat, i) => {
                        return (
                            <ListGroupItem key={i} className={this.props.activeChat === chat.id ? 'active' : ''} onClick={() => {this.activateChat(chat.id)}}>
                                <ListGroupItemHeading className="spread">
                                    <b>{chat.first_name} {chat.last_name}</b>
                                    <span>{moment(chat.messages.created_at, "YYYYMMDD").fromNow()}</span>
                                </ListGroupItemHeading>
                                <ListGroupItemText className="toe">
                                    {chat.messages.body}
                                </ListGroupItemText>
                            </ListGroupItem>
                        )
                    })}
                </ListGroup>
            </div>
        )
    }
}

export default Chats;