import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import ListUserComponent from './ListUserComponent';
import { withRouter } from 'react-router-dom';
import BattlesComponent from './BattlesComponent';
import GameComponent from './GameComponent';
import MultiGameComponent from './MultiGameComponent';

class HomeComponent extends Component {
  constructor(props) {
    super(props);
    this.state = this.initialState;
    if (localStorage.getItem('jwtToken') === null) {
      this.gologin();
    }
    if (localStorage.getItem('role') === 'none') {
      this.goChangePassword();
    }
  }
  initialState = {
    role: localStorage.getItem('role'), id: localStorage.getItem('uid')
  };
  gologin = () => {
    this.props.history.replace("/login");
  };
  goChangePassword() {
    this.props.history.replace("/changepass");
  }
  logoutClick = () => {
    localStorage.clear();
    this.gologin();
  };

  render() {
    return (
      <div>
        <Router>
          <div>
            <div className="d-flex flex-column flex-md-row align-items-center p-3 px-md-4 mb-3 bg-white border-bottom shadow-sm">
              <p className="h5 my-0 me-md-auto fw-normal">Sea Battles </p>
              <nav className="my-2 my-md-0 me-md-3">
                <Link to={"/"} className="p-2 text-dark">Battles</Link>
                <Link to={"/users"} className="p-2 text-dark">Users</Link>
                <Link to={"/game"} className="p-2 text-dark">Game</Link>
              </nav>
              <div style={{ flex: 1 }}></div>
              {<Link to={"/logout"} onClick={this.logoutClick} className="btn btn-outline-primary nav-link">Sign Out</Link>}
            </div>

            <Switch>
              <Route exact path="/users">
                <ListUserComponent />
              </Route>
              <Route exact path="/">
                <BattlesComponent />
              </Route>
              <Route exact path="/game">
                <GameComponent />
              </Route>
              <Route exact path="/multigame">
                <MultiGameComponent />
              </Route>
            </Switch>
          </div>
        </Router>
      </div>

    );
  }
}

export default withRouter(HomeComponent);
