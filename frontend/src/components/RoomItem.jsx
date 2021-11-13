export const RoomItem = (props) => {
    return (
        <div className="col mb-3">
            <div className="card">
                <div className="card-body">
                    <h5 className="card-title">{props.roomName}</h5>
                    <p className="card-text">Player: <span className="fw-bold">{props.players}</span></p>
                    <p className="card-text">Status: <span className="fw-bold">{props.status}</span></p>
                    <button onClick={() => props.joinRoom(props.roomName)}
                            className={`btn btn-sm px-4 ${props.status === "Available" ? 'btn-primary' : 'btn-secondary disabled'}`}
                    >
                        Join
                    </button>
                </div>
            </div>
        </div>
    );
}
