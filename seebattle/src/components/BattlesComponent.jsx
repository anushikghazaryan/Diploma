import React, { Component } from 'react';
import Service from '../services/Service';
import { Link, withRouter } from "react-router-dom";

class BattlesComponent extends Component {
    constructor(props){
        super(props);
        this.state={
            battles: []
        }
    }
    componentDidMount(){
        Service.getAllBattles().then((res) => {
            this.setState({battles: res.data.content});
        });
    }
    render() {
        return (
            <div className="container text-center">
                <h2>Battles List</h2>
                <div className="row">
                    <table className="table table-striped table-bordered">
                        <thead className="thead-dark">
                            <tr>
                                <th>User ID</th>
                                <th>Name</th>
                                <th>Sender</th>
                                <th>Receiver</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                this.state.battles.map(battle =>
                                <tr key={battle.id}>
                                    <td>{battle.id}</td>
                                    <td>{battle.name}</td>
                                    <td>{battle.senderid}</td>
                                    <td>{battle.receiverid}</td>
                                    {battle.status===0?<td><button className="btn btn-outline-primary">Apply</button><button className="btn btn-outline-primary">Refuse</button></td>:<td>Started</td>}
                                </tr>)
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

export default withRouter(BattlesComponent);