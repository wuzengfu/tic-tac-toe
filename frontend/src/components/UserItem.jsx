import { useState } from "react";

export const UserItem = (props) => {
    const [isHover, setIsHover] = useState(false);

    return (
        <li className="list-group-item d-flex justify-content-between align-items-start" style={isHover ? styles.listOnHover : null}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
        >
            <div className="ms-2 me-auto">
                <div className="fw-bold">{props.username}</div>
            </div>
        </li>
    );
}

const styles = {
    listOnHover: {
        backgroundColor: 'rgb(236,231,231)',
        cursor: 'pointer'
    }
}
