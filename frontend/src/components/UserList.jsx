import { UserItem } from "./UserItem";

export const UserList = (props) => {
    return (
        <ul className="list-group">
            {props.connectedUsers.map((user) =>
                <UserItem username={user.username}/>
            )}
        </ul>
    );

}
