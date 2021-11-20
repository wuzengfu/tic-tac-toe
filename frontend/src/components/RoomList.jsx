import { RoomItem } from "./RoomItem";

export const RoomList = (props) => {
    const getPlayers = key => {
        let players = props.rooms[key].users[0].username;

        if (props.rooms[key].users.length > 1) {
            players += `, ${props.rooms[key].users[1].username}`;
        }

        return players;
    }

    return (
        <div className="row row-cols-lg-3 row-cols-md-2 row-cols-1">
            {Object.keys(props.rooms).map((key,i) =>
                <RoomItem
                    players={getPlayers(key)}
                    status={props.rooms[key].status}
                    roomName={key}
                    joinRoom={props.joinRoom}
                    key={i}
                />)}
        </div>
    );
}
