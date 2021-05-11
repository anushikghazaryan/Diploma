import React, { Component } from 'react';
import Service from '../services/Service';
import { withRouter } from "react-router-dom";
import InfoPopup from './InfoPopupComponent';

class ListUserComponent extends Component {
    constructor(props){
        super(props);
        this.state={
            users: [],
            showPopup:false,userInfo:''
        }
    }
    componentDidMount(){
        Service.getAllUsers().then((res) => {
            this.setState({users: res.data.content});
        });
    }
    
    goPlay = () => {
        this.props.history.replace("/multigame");
    };
    // updatePopup = (popup) => {this.setState({ showPopup: popup})}
    // showPopupInfo(id){
    //     let info = '<h1>Start game</h1><br><a>Play</a>';
    //     this.setState({userInfo: info});
    //     this.setState({showPopup: true});
    // }
    render() {
        return (
            <div className="container text-center">
                <h2>Users List</h2>
                <div className="row">
                    <table className="table table-striped table-bordered">
                        <thead className="thead-dark">
                            <tr>
                                <th>User ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Rating</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                this.state.users.map(user =>
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.role.name}</td>
                                    <td>{user.rating}</td>
                                    <td><a onClick={() => this.goPlay()} className="btn btn-outline-primary">Play</a></td>
                                </tr>)
                            }
                        </tbody>
                    </table>
                </div>
                    <InfoPopup trigger={this.state.showPopup} setTrigger={this.updatePopup}>
                        {this.state.userInfo}
                    </InfoPopup>
            </div>
        );
    }
}

export default withRouter(ListUserComponent);