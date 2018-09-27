import React, {Component} from 'react';

import {Button, Card, CardBody, CardHeader, Collapse,} from 'reactstrap';

import Icon from '@fortawesome/react-fontawesome'
import {faChevronDown} from "@fortawesome/fontawesome-free-solid/shakable.es";
import User from './User';
import './Staff.css';

class InactiveMembers extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false
        }
    }

    render() {
        return (
            <div>
                <Card>
                    <CardHeader className="team-header">
                        <div className="team-name">
                            <h6>Inactive Staff</h6>
                        </div>
                        <div className="icons">
                            <Button color="link" className={!this.state.isOpen ?
                                'btn-round-border text-dark team-toggle-button' :
                                'btn-round-border text-dark team-toggle-button fa-rotate-180'}
                                    onClick={() => this.setState({isOpen: !this.state.isOpen})}><Icon
                                icon={faChevronDown}/></Button>
                        </div>
                    </CardHeader>
                    <Collapse isOpen={this.state.isOpen}>
                        <CardBody className="single-team">
                            {this.props.team.map((user, j) => {
                                return (
                                    <User
                                        id={user.id}
                                        key={user.id}
                                        index={user.team_position}
                                        position={user.user_position}
                                        selectStaff={(user, team_position, user_position, team_id) => this.props.selectStaff(user, team_position, user_position, team_id)}
                                        user={user}/>
                                )
                            })}
                        </CardBody>
                    </Collapse></Card></div>)
    }
}

export default InactiveMembers;
