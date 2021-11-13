import React from 'react';
import { Button, Modal } from "react-bootstrap";

export const NormalMsgModal = (props) => {
    return <Modal show={props.showModal} onHide={props.onHide}>
        <Modal.Header closeButton>
            <Modal.Title>{props.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{props.msg}</Modal.Body>
        <Modal.Footer>
            <Button variant="primary" onClick={props.onHide}>
                OK
            </Button>
        </Modal.Footer>
    </Modal>
};

