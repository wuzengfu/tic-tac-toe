import React, { Component } from 'react';

export default class Cell extends Component {
    render() {
        return (
            <td
                style={{...styles.cell, ...this.props.style, ...{cursor: this.props.clickable ? 'pointer': 'initial'}}}
                onClick={this.props.clickable ? this.props.onclick : null}
            >
                {this.props.value}
            </td>
        );
    }
}

const styles = {
    cell: {
        borderWidth: '2px',
        borderColor: 'black',
        borderStyle: "solid",
        width: "100px",
        height: "100px",
        fontSize: "1.7em",
        textAlign: 'center',
        verticalAlign: "middle",
        fontStyle: 'italic'
    }
}
