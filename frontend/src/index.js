import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route} from 'react-router-dom';
import Welcome from "./views/Welcome";
import Main from "./views/Main";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";

ReactDOM.render(
    <Router>
        <Route exact path="/" component={Welcome} />
        <Route exact path="/main/:username" component={Main} />
    </Router>,
    document.getElementById('root')
);
