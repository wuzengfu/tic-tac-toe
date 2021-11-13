import React from 'react';
import { Button, Modal } from "react-bootstrap";

export const GameResultModal = (props) => {
    return <Modal show={props.showGameResult} onHide={props.onHide}>
        <Modal.Header closeButton>
            <Modal.Title>Game result</Modal.Title>
        </Modal.Header>
        <Modal.Body>{props.gameResult}</Modal.Body>
        <Modal.Footer>
            <Button variant="primary" onClick={props.onHide}>
                OK
            </Button>
        </Modal.Footer>
    </Modal>
};

