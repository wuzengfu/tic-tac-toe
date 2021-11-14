import React, { Component } from 'react';
import { Button, Form, FormControl } from 'react-bootstrap';
import styles from "../stylesheets/welcome.module.css";

export default class Welcome extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: ''
        }
    }

    handleUsernameInput = e => {
        this.setState({username: e.target.value});
    }

    submitForm = () => {
        let username = this.state.username;
        if (username.length < 3 || username.length > 10) {
            alert("The length of username is between 2 and 10");
        } else {
            this.setState({username: ''});
            this.props.history.push("/main/" + username);
        }
    }

    render() {
        return (
            <div className={`d-flex align-items-center justify-content-center vh-100 ${styles.mainBackgroundColor}`}>
                <div className={styles.container}>
                    <h5 className="text-white mt-4 mb-4 fw-bold">
                        Welcome to Tic-Toe-toe 🎉
                    </h5>
                    <div className={styles.innerContainer}>
                        <Form onSubmit={this.submitForm}>
                            <Form.Label className={styles.usernameLabel}>
                                Enter your username:
                            </Form.Label>
                            <FormControl minLength="2" maxLength="10" type="text"
                                         className={`${styles.usernameInput} mb-3`}
                                         onChange={this.handleUsernameInput}/>
                            <Button variant={"primary"} size={"sm"} className={"px-4"} type={"submit"}>
                                <span>Go 🚗</span>
                            </Button>
                        </Form>
                    </div>
                </div>
            </div>
        );
    }
}
