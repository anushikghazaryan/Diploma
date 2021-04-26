import './App.css';
import HomeComponent from './components/HomeComponent';
import LoginComponent from './components/LoginComponent';
import {BrowserRouter as Router,Switch,Route} from "react-router-dom";
import RegisterConponent from './components/RegisterConponent';


function App() {
  return (
    <div>
      <Router>
        <Switch>
            <Route exact path="/login"component={LoginComponent}/>
            <Route exact path="/" component={HomeComponent}/>
            <Route exact path="/register" component={RegisterConponent}/>
        </Switch>
    </Router>
    </div>
  );
}

export default App;
