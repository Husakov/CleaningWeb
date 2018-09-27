import React, {Component} from 'react';
import { InputGroup, Input, InputGroupAddon, Button, InputGroupText } from 'reactstrap';
import Icon from '@fortawesome/react-fontawesome';
import { faSearch, faVolumeOff } from "@fortawesome/fontawesome-free-solid/shakable.es";
import moment from 'moment'
import './Chat.css';

class Messages extends Component {
    constructor(props) {
        super(props);
        this.state = {
            search: ''
        }
    }

    onInputChange = (evt) => {
        this.setState({
            search: evt.target.value
        })
    }

    render() {
        return (
            <div className="messages-list">
                <div className="messages-actions d-flex justify-content-between align-items-center p-2 shadow-sm bg-white rounded">
                    <div className="d-flex justify-content-center align-items-center">
                        <img src="https://s3.amazonaws.com/housecleaning/images/avatars/man%281%29.png" alt="profile" className="messages-profile-image" />
                        <div className="d-flex flex-column pl-1">
                            <div>{this.props.chatPerson.first_name} {this.props.chatPerson.last_name}</div>
                            <div>{this.props.chatPerson.phone_number}</div>
                        </div>
                    </div>
                    <div className="d-flex justify-content-center align-items-center">
                        <InputGroup>
                            <Input value={this.state.search} onChange={this.onInputChange}/>
                            <InputGroupAddon addonType="append">
                                <InputGroupText><Icon icon={faSearch} size="sm" fixedWidth/></InputGroupText>
                            </InputGroupAddon>
                        </InputGroup>
                        <Icon className="pl-2" icon={faVolumeOff} size="sm" fixedWidth/>
                    </div>
                </div>
                <ul className="messages-container p-2">
                    {this.props.messages.map((group, i) => {
                        const date = moment(group.date).calendar()
                        const msgs = group.messages
                        .filter(chat => chat.body.toLowerCase().indexOf(this.state.search) > -1)
                        .map((chat, j) => {
                            return (
                                <li key={j} className={chat.sender === 'company' ? 'sender message' : 'message'}>
                                    <div className="text">
                                        <p>{chat.body}</p>
                                        <p className="time mt-auto p-2 bd-highlight">{moment(chat.created_at).format('LT')}</p>
                                    </div>
                                </li>
                            )
                        })
                        return (
                            <span key={i}>
                                {
                                    this.state.search === '' ?
                                    <li style={{width: '100%'}} className="d-flex justify-content-center align-items-center">
                                        <div>{date}</div>
                                    </li>
                                    :
                                    ''
                                }
                                
                                {msgs}
                            </span>
                        )
                    })}
                </ul>
            </div>
        )
    }
}

export default Messages;