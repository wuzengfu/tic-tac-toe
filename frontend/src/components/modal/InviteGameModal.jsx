import { Modal, Button, Form } from 'react-bootstrap';
import { useState } from "react";

export const InviteGameModal = (props) => {
    const [selectedUser, setSelectedUser] = useState("");

    const getAvailableUserList = () => {
        let keys = Object.keys(props.availableUsers);

        return keys.map((key, i) => {
            let user = props.availableUsers[key];
            return <option value={user.socketid} key={i}>{user.username}</option>
        });
    }

    const handleSelectChange = e => {
        setSelectedUser(e.target.value);
    }

    const handleSendInvitation = () => {
        if(selectedUser !== ""){
            setSelectedUser("");
            props.socket.emit("invite player", selectedUser, props.roomName);
            props.onHide();
        }else{
            alert("Please select a user!");
        }
    }

    return (
        <Modal show={props.showInviteGameModal} onHide={props.onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Choose a player to invite!</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Select aria-label="Default select example" onChange={handleSelectChange}>
                    <option value={""}>Select a player:</option>
                    {getAvailableUserList()}
                </Form.Select>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={props.onHide}>
                    Cancel
                </Button>
                <Button variant="success" onClick={handleSendInvitation}>
                    Send
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
