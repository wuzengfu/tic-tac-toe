import { UserItem } from "./UserItem";

export const UserList = (props) => {
    return (
        <ul className="list-group">
            {props.connectedUsers.map((user, i) =>
                <UserItem
                    username={user.username}
                    getUserGameHistory={() => props.getUserGameHistory(user.socketid)}
                    key={i}
                />
            )}
        </ul>
    );

}
