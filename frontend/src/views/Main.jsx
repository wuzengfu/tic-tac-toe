import React, { Component } from 'react';
import styles from "../stylesheets/main.module.css";
import SocketIoClient from 'socket.io-client';
import userImage from "../images/user.png";
import { baseURL } from '../config';
import {
    Board,
    ExitBtn,
    RoomList,
    UserList,
    InviteGameModal,
    GameInvitationModal,
    NormalMsgModal
} from '../components';
import { Table } from "react-bootstrap";

const initGame = {1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '', 9: ''};

export default class Main extends Component {
    constructor(props) {
        super(props);

        this.state = {
            username: this.props.match.params.username,
            socket: SocketIoClient(baseURL),
            connectedUsers: [],
            availableUsers: [],
            rooms: [],
            roomName: null,
            tab: "mainTab",
            roomDOM: {
                disableReadyBtn: false,
                hideMyReady: true,
                hideMyImage: false,
                hideOpponentReady: true,
                opponentName: null,
                hideOpponent: true,
                hideMyOnMoveBorder: true,
                hideOpponentOnMoveBorder: true,
                toggleCells: false,
                gameStarted: false
            },
            modal: {
                showGameResult: false,
                showGameInvitation: false,
                showInviteGame: false,
                normalMsg: {showNormalMsg: false, title: '', msg: ''}
            },
            gameRecord: {...initGame},
            firstPlayer: null,
            gameResult: null,
            invitation: {username: '', socketid: '', roomName: ''},
            gameHistory: null
        }

    }

    componentDidMount() {
        if (!window.localStorage.getItem("firstRendered")) {
            this.state.socket.emit("add user", this.state.username);
            this.setState({firstMount: false});
        }

        //connect socket
        this.state.socket.on("connect", () => {
            console.log("Connected to the server!");
        });

        //disconnect socket
        this.state.socket.on("disconnect", () => {
            window.localStorage.clear();
        });

        //update connected user list
        this.state.socket.on("update user", connectedUsers => {
            this.setState({connectedUsers});
        });

        //update room list
        this.state.socket.on("update room", rooms => {
            this.setState({rooms});
        });

        //someone presses ready button
        this.state.socket.on("someone ready", room => {
            const {users} = room;

            users.forEach(user => {
                //if it is opponent who presses ready
                if (user.socketid !== this.state.socket.id && user.ready) {
                    //show opponent is ready
                    this.setState({roomDOM: {...this.state.roomDOM, hideOpponentReady: false}});
                }
            });
        });

        //someone joined the room
        this.state.socket.on("someone joined", users => {
            users.forEach(user => {
                if (user.socketid !== this.state.socket.id) {
                    this.setState({
                        roomDOM: {
                            ...this.state.roomDOM,
                            opponentName: user.username,
                            hideOpponentReady: !user.ready,
                            hideOpponent: false
                        }
                    });
                }
            });
        });

        //someone leave the room
        this.state.socket.on("onePlayer left", socketid => {
            this.setState({
                roomDOM: {
                    ...this.state.roomDOM,
                    hideOpponentReady: true,
                    hideOpponent: true,
                    hideMyReady: (socketid !== this.state.socketid && !this.state.roomDOM.gameStarted) ? this.state.roomDOM.hideMyReady : true,
                    hideMyOnMoveBorder: true,
                    hideOpponentOnMoveBorder: true,
                    toggleCells: false,
                    disableReadyBtn: this.state.roomDOM.gameStarted ? false : this.state.roomDOM.disableReadyBtn,
                    gameStarted: this.state.roomDOM.gameStarted ? false : this.state.roomDOM.gameStarted
                },
                gameRecord: {...initGame},
            });
        });

        //game started
        this.state.socket.on("game start", game => {
            this.setState({
                roomDOM: {...this.state.roomDOM, hideMyReady: true, hideOpponentReady: true, gameStarted: true},
                gameRecord: {...initGame}
            });

            //get who is assigned as first player
            if (game.firstPlayer === this.state.socket.id) { //I am the first player
                this.setState({
                    roomDOM: {...this.state.roomDOM, hideMyOnMoveBorder: false, toggleCells: true},
                    firstPlayer: game.firstPlayer
                });
            } else { //the opponent is the first player
                this.setState({roomDOM: {...this.state.roomDOM, hideOpponentOnMoveBorder: false, toggleCells: false}});
            }
        });

        //someone made a move
        this.state.socket.on("someone made a move", (coordinate, movedBy, firstPlayer) => {
            let gameRecord = this.state.gameRecord;
            gameRecord[coordinate.value] = movedBy === firstPlayer ? "X" : "O";

            if (movedBy === this.state.socket.id) { //myself made a move
                this.setState({
                    roomDOM: {
                        ...this.state.roomDOM, hideMyOnMoveBorder: true, hideOpponentOnMoveBorder: false,
                        toggleCells: false
                    },
                    gameRecord
                });
            } else {
                this.setState({
                    roomDOM: {
                        ...this.state.roomDOM,
                        hideMyOnMoveBorder: false,
                        hideOpponentOnMoveBorder: true,
                        toggleCells: true
                    },
                    gameRecord
                });
            }
        });

        //game over
        this.state.socket.on("game over", async (gameStatus, movedBy, coordinate, firstPlayer) => {
            let gameRecord = this.state.gameRecord;
            gameRecord[coordinate.value] = movedBy === firstPlayer ? "X" : "O";

            let gameResult;
            if (gameStatus === "draw") {
                gameResult = "You draw!";
            } else if (gameStatus === "win" && movedBy === this.state.socket.id) {
                gameResult = "You win!";
            } else {
                gameResult = "You lose!";
            }

            this.setState({
                roomDOM: {
                    ...this.state.roomDOM, hideMyOnMoveBorder: true,
                    hideOpponentOnMoveBorder: true, disableReadyBtn: false,
                    gameStarted: false,
                    toggleCells: false
                },
                modal: {...this.state.modal, normalMsg: {showNormalMsg: true, title: "Game Result", msg: gameResult}},
                gameRecord: {...initGame},
                gameResult
            });
        });

        //receive invitation
        this.state.socket.on("receive invitation", invitation => {
            this.setState({invitation, modal: {...this.state.modal, showGameInvitation: true}});
        });

        //reject invitation
        this.state.socket.on("reject invitation", username => {
            console.log("reject");
            this.setState({
                modal: {
                    ...this.state.modal,
                    normalMsg: {
                        showNormalMsg: true,
                        title: "Invitation Status",
                        msg: `${username} rejected your invitation!`
                    }
                }
            });
        })
    }

    handleInviteBtn = () => {
        if (this.state.rooms[this.state.roomName].status === "Available") {
            let availableUsers = [];
            Object.keys(this.state.connectedUsers).forEach((key, i) => {
                if (this.state.connectedUsers[key].socketid !== this.state.socket.id) {
                    availableUsers.push(this.state.connectedUsers[key]);
                }
            });
            this.setState({availableUsers, modal: {...this.state.modal, showInviteGame: true}});
        } else {
            alert("The room is occupied! You cannot invite other players!");
        }
    }


    handleLeaveBtn = () => {
        this.state.socket.emit("leave room", this.state.roomName);
        this.setState({
            roomDOM: {...this.state.roomDOM, disableReadyBtn: false, hideMyReady: true, hideMyImg: false},
            tab: "mainTab"
        });
    }

    handleReadyBtn = () => {
        this.setState({roomDOM: {...this.state.roomDOM, hideMyReady: false, disableReadyBtn: true}});
        this.state.socket.emit("game ready", this.state.roomName);
    }

    handleCreateRoomBtn = () => {
        this.state.socket.emit("create room", roomName => {
            this.setState({roomName, tab: "roomTab"});
        });
    }

    getUserGameHistory = socketid => {
        this.state.socket.emit("get game history", socketid, gameHistory => {
            let output = "No Results!";

            if (gameHistory.length !== 0) {
                output =
                    <Table striped bordered hover size="sm">
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Player</th>
                            <th>Opponent</th>
                            <th>Result</th>
                            <th>Time</th>
                        </tr>
                        </thead>
                        <tbody>
                        {Object.keys(gameHistory).map((key, i) => {
                            return (<tr key={i}>
                                <td>{i + 1}</td>
                                <td>{gameHistory[key].myName}</td>
                                <td>{gameHistory[key].opponentName}</td>
                                <td>{gameHistory[key].result}</td>
                                <td>{gameHistory[key].time}</td>
                            </tr>);
                        })}
                        </tbody>
                    </Table>;
            }

            this.setState({
                modal: {
                    ...this.state.modal, normalMsg: {
                        showNormalMsg: true,
                        title: "Game History",
                        msg: output
                    }
                }
            });
        });
    }

    joinRoom = roomName => {
        this.state.socket.emit("join room", roomName);
        this.setState({roomName, tab: "roomTab"});
    }


    render() {
        return (
            <div className={styles.container}>
                <div className={`d-flex justify-content-between align-items-center px-2 ${styles.header}`}>
                    <h4 className="text-white">😃Tic-Tac-Toe</h4>
                    <ExitBtn/>
                </div>

                <div className="row m-0">
                    <div className={`col-2 p-2 ${styles.leftSection}`}>
                        <h5 className="text-center">Connected Users:</h5>
                        <UserList connectedUsers={this.state.connectedUsers}
                                  getUserGameHistory={this.getUserGameHistory}/>
                    </div>

                    {this.state.tab === "mainTab" ?
                        <div className={`col-10 p-2 text-dark ${styles.rightSection}`}>
                            <button className="btn btn-outline-primary mb-2" onClick={this.handleCreateRoomBtn}>
                                Create a room
                            </button>

                            <RoomList rooms={this.state.rooms} joinRoom={this.joinRoom}/>
                        </div>
                        :
                        <div className={`col-10 p-2 row text-dark ${styles.rightSectionRoom}`}>
                            <div className="col-3 d-flex flex-column-reverse">
                                <ul className="list-group">
                                    <li onClick={this.handleLeaveBtn} className="btn btn-secondary">Leave</li>
                                    <li onClick={this.handleInviteBtn} className="btn btn-success">Invite</li>
                                    <li onClick={this.handleReadyBtn}
                                        className={`btn btn-danger ${this.state.roomDOM.disableReadyBtn ? 'disabled' : ''}`}>Ready
                                    </li>
                                </ul>

                            </div>

                            <div className="col-9">
                                <div className="d-flex flex-row">
                                    <div
                                        className={`user ${styles.user} ${this.state.roomDOM.hideOpponent ? 'invisible' : ''}`}>
                                        <img src={userImage} alt="user"
                                             className={`border border-dark ${this.state.roomDOM.hideOpponentOnMoveBorder ? '' : styles.showOnMoveBorder}`}/>
                                        <p>{this.state.roomDOM.opponentName}</p>
                                    </div>
                                    <button
                                        className={`readyBtn btn btn-outline-danger btn-sm h-25 mt-3 ${this.state.roomDOM.hideOpponentReady ? 'visually-hidden' : ''}`}
                                        disabled>
                                        Ready
                                    </button>
                                </div>

                                <Board
                                    gameRecord={this.state.gameRecord}
                                    toggleCells={this.state.roomDOM.toggleCells}
                                    roomName={this.state.roomName}
                                    socket={this.state.socket}/>

                                <div className="d-flex flex-row">
                                    <div className={`user ${styles.user}`}>
                                        <img src={userImage} alt="user"
                                             className={`border border-dark ${this.state.roomDOM.hideMyOnMoveBorder ? '' : styles.showOnMoveBorder}`}/>
                                        <p>{this.state.username}</p>
                                    </div>
                                    <button
                                        className={`btn btn-outline-danger btn-sm h-25 mt-3 ${this.state.roomDOM.hideMyReady ? 'visually-hidden' : ''}`}
                                        disabled>Ready
                                    </button>
                                </div>
                            </div>
                        </div>}
                </div>

                <GameInvitationModal
                    joinRoom={() => this.joinRoom(this.state.invitation.roomName)}
                    socket={this.state.socket}
                    invitation={this.state.invitation}
                    showGameInvitationModal={this.state.modal.showGameInvitation}
                    onHide={() => this.setState({modal: {...this.state.modal, showGameInvitation: false}})}
                />

                <InviteGameModal
                    roomName={this.state.roomName}
                    showInviteGameModal={this.state.modal.showInviteGame}
                    availableUsers={this.state.availableUsers}
                    socket={this.state.socket}
                    onHide={() => this.setState({modal: {...this.state.modal, showInviteGame: false}})}
                />

                {/*Invitation Reject Message*/}
                <NormalMsgModal
                    showModal={this.state.modal.normalMsg.showNormalMsg}
                    onHide={() => this.setState({
                        modal: {...this.state.modal, normalMsg: {...this.state.normalMsg, showNormalMsg: false}}
                    })}
                    title={this.state.modal.normalMsg.title}
                >
                    {this.state.modal.normalMsg.msg}
                </NormalMsgModal>

                {/*Game History*/}
                <NormalMsgModal
                    showModal={this.state.modal.normalMsg.showNormalMsg}
                    onHide={() => this.setState({
                        modal: {...this.state.modal, normalMsg: {...this.state.normalMsg, showNormalMsg: false}}
                    })}
                    title={this.state.modal.normalMsg.title}
                >
                    {this.state.modal.normalMsg.msg}
                </NormalMsgModal>

            </div>

        );
    }
}
