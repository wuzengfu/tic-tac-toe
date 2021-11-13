import React, { Component } from 'react';
import styles from "../stylesheets/main.module.css";
import SocketIoClient from 'socket.io-client';
import userImage from "../images/user.png";
import { baseURL } from '../config';
import { Board, ExitBtn, RoomList, UserList, GameResultModal } from '../components';

const initGame = {1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 7: '', 8: '', 9: ''};

export default class Main extends Component {
    constructor(props) {
        super(props);

        this.state = {
            username: this.props.match.params.username,
            socket: SocketIoClient(baseURL),
            connectedUsers: [],
            rooms: [],
            roomName: null,
            tab: "mainTab",
            disableReadyBtn: false,
            hideMyReady: true,
            hideMyImage: false,
            hideOpponentReady: true,
            opponentName: null,
            hideOpponent: true,
            hideMyOnMoveBorder: true,
            hideOpponentOnMoveBorder: true,
            gameRecord: {...initGame},
            toggleCells: false,
            firstPlayer: null,
            showGameResult: false,
            gameResult: null,
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
                    this.setState({hideOpponentReady: false});
                }
            });
        });

        //someone joined the room
        this.state.socket.on("someone joined", users => {
            users.forEach(user => {
                if (user.socketid !== this.state.socket.id) {
                    this.setState({opponentName: user.username, hideOpponentReady: !user.ready, hideOpponent: false});
                }
            });
        });

        //someone leave the room
        this.state.socket.on("onePlayer left", users => {
            //hide opponent
            this.setState({hideOpponentReady: true});
            this.setState({hideOpponent: true});

            this.setState({hideMyReady: !users[0].ready});

            this.setState({hideMyOnMoveBorder: true});
            this.setState({hideOpponentOnMoveBorder: true});

            this.setState({gameRecord: {...initGame}});
        });

        //game started
        this.state.socket.on("game start", game => {
            this.setState({gameRecord: {...initGame}, hideMyReady: true, hideOpponentReady: true});

            //get who is assigned as first player
            if (game.firstPlayer === this.state.socket.id) { //I am the first player
                this.setState({hideMyOnMoveBorder: false, toggleCells: true, firstPlayer: game.firstPlayer});
            } else { //the opponent is the first player
                this.setState({hideOpponentOnMoveBorder: false, toggleCells: false});
            }
        });

        //someone made a move
        this.state.socket.on("someone made a move", (coordinate, movedBy, firstPlayer) => {
            let gameRecord = this.state.gameRecord;
            gameRecord[coordinate.value] = movedBy === firstPlayer ? "X" : "O";

            if (movedBy === this.state.socket.id) { //myself made a move
                this.setState({hideMyOnMoveBorder: true, hideOpponentOnMoveBorder: false, toggleCells: false});
            } else {
                this.setState({hideMyOnMoveBorder: false, hideOpponentOnMoveBorder: true, toggleCells: true});
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
                hideMyOnMoveBorder: true,
                hideOpponentOnMoveBorder: true,
                showGameResult: true,
                disableReadyBtn: false,
                gameRecord: {...initGame},
                gameResult
            });
        });
    }


    handleLeaveBtn = () => {
        this.state.socket.emit("leave room", this.state.roomName);
        this.setState({disableReadyBtn: false, hideMyReady: true, hideMyImg: false, tab: "mainTab"});
    }

    handleReadyBtn = () => {
        this.setState({hideMyReady: false, disableReadyBtn: true});
        this.state.socket.emit("game ready", this.state.roomName);
    }

    handleCreateRoomBtn = () => {
        this.state.socket.emit("create room", roomName => {
            this.setState({roomName, tab: "roomTab"});
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
                        <UserList connectedUsers={this.state.connectedUsers}/>
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
                                    <li onClick={this.handleLeaveBtn} className="btn btn-success">Invite</li>
                                    <li onClick={this.handleReadyBtn}
                                        className={`btn btn-danger ${this.state.disableReadyBtn ? 'disabled' : ''}`}>Ready
                                    </li>
                                </ul>
                            </div>

                            <div className="col-9">
                                <div className="d-flex flex-row">
                                    <div
                                        className={`user ${styles.user} ${this.state.hideOpponent ? 'invisible' : ''}`}>
                                        <img src={userImage} alt="user"
                                             className={`border border-dark ${this.state.hideOpponentOnMoveBorder ? '' : styles.showOnMoveBorder}`}/>
                                        <p>{this.state.opponentName}</p>
                                    </div>
                                    <button
                                        className={`readyBtn btn btn-outline-danger btn-sm h-25 mt-3 ${this.state.hideOpponentReady ? 'visually-hidden' : ''}`}
                                        disabled>
                                        Ready
                                    </button>
                                </div>

                                <Board
                                    gameRecord={this.state.gameRecord}
                                    toggleCells={this.state.toggleCells}
                                    roomName={this.state.roomName}
                                    socket={this.state.socket}/>

                                <div className="d-flex flex-row">
                                    <div className={`user ${styles.user}`}>
                                        <img src={userImage} alt="user"
                                             className={`border border-dark ${this.state.hideMyOnMoveBorder ? '' : styles.showOnMoveBorder}`}/>
                                        <p>{this.state.username}</p>
                                    </div>
                                    <button
                                        className={`btn btn-outline-danger btn-sm h-25 mt-3 ${this.state.hideMyReady ? 'visually-hidden' : ''}`}
                                        disabled>Ready
                                    </button>
                                </div>
                            </div>
                        </div>}
                </div>

                <GameResultModal showGameResult={this.state.showGameResult}
                                 gameResult={this.state.gameResult}
                                 onHide={() => this.setState({showGameResult: false})}
                />
            </div>

        );
    }
}
