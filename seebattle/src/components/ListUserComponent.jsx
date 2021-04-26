import React, { Component } from 'react';
import Service from '../services/Service';
import { Link, withRouter } from "react-router-dom";

class ListUserComponent extends Component {
    constructor(props){
        super(props);
        this.state={
            users: []
        }
    }
    componentDidMount(){
        Service.getAllUsers().then((res) => {
            this.setState({users: res.data.content});
        });
    }
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
                                    <td><button className="btn btn-outline-primary">Play</button></td>
                                </tr>)
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

export default withRouter(ListUserComponent);