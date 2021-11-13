import React, { Component } from 'react';
import Cell from '../components/Cell';

export default class Board extends Component {
    constructor(props) {
        super(props);

        this.state = {
            keys: Object.keys(this.props.gameRecord)
        }
    }

    getCellOnClick = coordinate => {
        this.props.socket.emit("make move", this.props.roomName, coordinate);
    }

    isCellClickable = cellNo => {
        if (this.props.toggleCells) {
            return this.props.gameRecord[cellNo] === "";
        }

        return false;
    }


    render() {
        return (
            <table style={styles.board}>
                <tbody>
                <tr>
                    <Cell clickable={this.isCellClickable(1)}
                          style={{borderTopWidth: 0, borderLeftWidth: 0}}
                          value={this.state.keys[1] !== null ? this.props.gameRecord[1] : ''}
                          onclick={() => this.getCellOnClick(1)}
                    />
                    <Cell clickable={this.isCellClickable(2)}
                          style={{borderTopWidth: 0}}
                          value={this.state.keys[2] !== null ? this.props.gameRecord[2] : ''}
                          onclick={() => this.getCellOnClick(2)}
                    />
                    <Cell clickable={this.isCellClickable(3)}
                          style={{borderTopWidth: 0, borderRight: 0}}
                          value={this.state.keys[3] !== null ? this.props.gameRecord[3] : ''}
                          onclick={() => this.getCellOnClick(3)}
                    />
                </tr>

                <tr>
                    <Cell clickable={this.isCellClickable(4)}
                          style={{borderLeftWidth: 0}}
                          value={this.state.keys[4] !== null ? this.props.gameRecord[4] : ''}
                          onclick={() => this.getCellOnClick(4)}
                    />
                    <Cell clickable={this.isCellClickable(5)}
                          style={{borderTopWidth: 0}}
                          value={this.state.keys[5] !== null ? this.props.gameRecord[5] : ''}
                          onclick={() => this.getCellOnClick(5)}
                    />
                    <Cell clickable={this.isCellClickable(6)}
                          style={{borderRight: 0}}
                          value={this.state.keys[6] !== null ? this.props.gameRecord[6] : ''}
                          onclick={() => this.getCellOnClick(6)}
                    />
                </tr>

                <tr>
                    <Cell clickable={this.isCellClickable(7)}
                          style={{borderLeftWidth: 0, borderBottomWidth: 0}}
                          value={this.state.keys[7] !== null ? this.props.gameRecord[7] : ''}
                          onclick={() => this.getCellOnClick(7)}
                    />
                    <Cell clickable={this.isCellClickable(8)}
                          style={{borderLeftWidth: 0, borderBottomWidth: 0}}
                          value={this.state.keys[8] !== null ? this.props.gameRecord[8] : ''}
                          onclick={() => this.getCellOnClick(8)}
                    />
                    <Cell clickable={this.isCellClickable(9)}
                          style={{borderRightWidth: 0, borderBottomWidth: 0}}
                          value={this.state.keys[9] !== null ? this.props.gameRecord[9] : ''}
                          onclick={() => this.getCellOnClick(9)}
                    />
                </tr>
                </tbody>
            </table>
        );
    }
}

const styles = {
    board: {
        marginTop: "1%",
        marginBottom: "2%",
        borderCollapse: "collapse"
    },
}
