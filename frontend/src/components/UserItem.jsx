export const UserItem = (props) => {
    return (
        <li className="list-group-item d-flex justify-content-between align-items-start">
            <div className="ms-2 me-auto">
                <div className="fw-bold">{props.username}</div>
            </div>
        </li>
    );
}
