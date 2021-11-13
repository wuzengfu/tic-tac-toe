const Cell = require("./Cell");

class TicTacToe {
    constructor(player1, player2) {
        this.row = 3;
        this.col = 3;
        this.lastCoordinate = null;
        this.lastMovedBy = null;
        this.players = [player1, player2];
        this.firstPlayer = this.randomlyAssignedFirstOrSecond();
        this.board = this.initBoard();
        this.gameStatus = null;
        this.noOfPieces = 0;
    }

    /**
     * Initialize a row X col board
     *
     * Example : 3 X 3
     * [
     *   [1 , 2 , 3],
     *   [4 , 5 , 6],
     *   [7 , 8 , 9]
     * ]
     */
    initBoard() {
        let table = [];

        for (let i = 0; i < this.row; i++) {
            let inner = [];

            for (let j = 0; j < this.col; j++) {
                let cell = new Cell((j + 1) + (i * 3));
                inner.push(cell);
            }

            table.push(inner);
        }

        return table;
    }

    /**
     * Randomly assign the players to be first or second
     * @returns string - the player who is assigned first
     */
    randomlyAssignedFirstOrSecond() {
        //generate a number between 1 and 10
        let num = Math.floor(Math.random() * 10 + 1);
        return this.players[num % 2];
    }


    /**
     * Convert the coordinate which is a number between 1 and row*col to [row , col]
     * @return array - [row, col]
     */
    convertCoordinate(coordinate) {
        coordinate--;
        let row = Math.floor((coordinate) / 3);
        let col = coordinate % 3;

        return [row, col];
    }

    /**
     * Called when someone made a move
     * @param coordinate an integer between row*col
     * @param movedBy the person who made this move
     */
    makeMove(coordinate, movedBy) {
        //get converted coordinate
        let [x, y] = this.convertCoordinate(coordinate);

        //if the cell is available to make a move
        if (this.board[x][y].available) {
            this.noOfPieces++; //increment the existing pieces
            this.lastMovedBy = movedBy; //record the last person who made the move
            this.lastCoordinate = {value: coordinate, x, y}; //record the coordinate of the last move
            let cell = this.board[x][y]; //get the target cell

            cell.value = movedBy === this.firstPlayer ? 0 : 1; //first player will be 0 otherwise 1
            cell.available = false; //make the cell unavailable

            this.updateGameStatus();
        }
    }

    /**
     * Update the game status, assign the game status to this.gameStatus
     * <ol>
     *     <li> in game </li>
     *     <li> win </li>
     *     <li> draw </li>
     *  </ol>
     */
    updateGameStatus() {
        this.gameStatus = this.checkWinAndLose();

        if (this.noOfPieces === this.row * this.col && this.gameStatus === "in game") {
            this.gameStatus = "draw";
        }
    }


    /**
     * Check if the game is finished
     * @returns {string} game status
     */
    checkWinAndLose() {
        let {x, y} = this.lastCoordinate;
        let pieceValue = this.board[x][y].value;

        //check horizontally
        let horizontalPieces = 0;
        for (let i = 0; i < this.col; i++) {
            if (this.board[x][i].value === pieceValue) horizontalPieces++;
        }
        if (horizontalPieces === 3) return "win";

        //check vertically
        let verticalPieces = 0;
        for (let i = 0; i < this.row; i++) {
            if (this.board[i][y].value === pieceValue) verticalPieces++;
        }
        if (verticalPieces === 3) return "win";

        //check diagonally (left to right)
        let diagonalPiece1 = 0;
        for (let i = 0; i < this.col; i++) {
            if (this.board[i][i].value === pieceValue) diagonalPiece1++;
        }
        if (diagonalPiece1 === 3) return "win";

        //check diagonally (right to left)
        let diagonalPiece2 = 0;
        for (let i = 0; i < this.col; i++) {
            if (this.board[i][3 - i - 1].value === pieceValue) diagonalPiece2++;
        }
        if (diagonalPiece2 === 3) return "win";

        return "in game";
    }
}

module.exports = TicTacToe;

