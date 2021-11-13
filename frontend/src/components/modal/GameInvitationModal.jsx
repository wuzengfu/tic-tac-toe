import { Modal, Button } from 'react-bootstrap';

export const GameInvitationModal = (props) => {
    const handleReject = () => {
        props.socket.emit("reject invitation", props.invitation.socketid);
        props.onHide();
    }

    const handleAccept = () => {
        props.joinRoom();
        props.onHide();
    }

    return (
        <Modal show={props.showGameInvitationModal} onHide={props.onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Game Invitations</Modal.Title>
            </Modal.Header>
            <Modal.Body>{props.invitation.username} invites you for a game!</Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={handleReject}>
                    Reject
                </Button>
                <Button variant="success" onClick={handleAccept}>
                    Accept
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
