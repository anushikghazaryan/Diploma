// import React, { Component } from 'react';
// import Service from '../services/Service';
// import { withRouter } from "react-router-dom";

// class UserInfoComponent extends Component {
//     constructor(props){
//         super(props);
//         this.state={
//             userInfo: [],
//         }
//     }
//     componentDidMount(){
//         Service.getUserInfo().then((res) => {
            
//         console.log("gnac");
//             this.setState({userInfo: res.data});
//             console.log(this.state.userInfo + "iser info");
//         });
//     }

//     render() {
//         return (
//             <div className="container text-center">
//                 <h2>My  page</h2>
//                 <div className="row">
//                     <table className="table table-striped table-bordered">
//                         <thead className="thead-dark">
//                             <tr>
//                                 <th>User ID</th>
//                                 <th>Name</th>
//                                 <th>Rating</th>
//                                 {/* <th>Played games</th> */}
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {
                                
//                                 <tr key={this.state.userInfo.id}>
//                                     <td>{this.state.userInfo.id}</td>
//                                     <td>{this.state.userInfo.name}</td>
//                                     <td>{this.state.userInfo.Rating}</td>
//                                 </tr>
//                             }
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         );
//     }
// }

// export default withRouter(UserInfoComponent);