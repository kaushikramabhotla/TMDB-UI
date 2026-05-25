import { useEffect, useState } from "react";
import axios from "axios";

function FriendsChat({ connection }) {
    const [friends, setFriends] = useState([]);
    const [activeFriend, setActiveFriend] = useState(null);
    // messages keyed by friendId: { [friendId]: [{sender, text}] }
    const [allMessages, setAllMessages] = useState({});
    const [input, setInput] = useState("");

    const token =
    localStorage.getItem("token");

    const decoded =
        JSON.parse(
            atob(token.split('.')[1])
        );

    const currentUserId =
        decoded[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ];

    // Load friends list
    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(
                    "https://localhost:7022/api/users/friends",
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setFriends(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchFriends();
    }, []);

    // Listen for incoming direct messages
    useEffect(() => {

    if (!connection)
        return;

    // Remove old listener first
    connection.off("ReceiveDirectMessage");

    // Listen for incoming realtime messages
    connection.on(
    "ReceiveDirectMessage",
    (senderId, senderName, message) => {
        console.log(
            "GLOBAL MESSAGE:",
            senderName,
            message
        );
        setAllMessages(prev => ({
            ...prev,
            [senderId]: [
                ...(prev[senderId] || []),
                {
                    sender: senderName,
                    text: message
                }
            ]
        }));
    }
);

    // Rejoin SignalR group after reconnect
    connection.onreconnected(async () => {
        console.log("RECONNECTED");
        const token = localStorage.getItem("token");
        if (token)
        {
            const decoded =
                JSON.parse(
                    atob(token.split('.')[1])
                );
            const userId =
                decoded[
                    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
                ];

            await connection.invoke(
                "JoinUserGroup",
                userId
            );
            console.log(
                "REJOINED GROUP:",
                userId
            );
        }
    });

    return () => {

        connection.off(
            "ReceiveDirectMessage"
        );
    };

}, [connection]);

    useEffect(() => {

    if (!activeFriend)
        return;

    const loadMessages =
        async () => {
        try
        {
            const token =
                localStorage.getItem(
                    "token"
                );
            const res =
                await axios.get(
                    `https://localhost:7022/api/messages/${activeFriend.id}`,
                    {
                        headers:
                        {
                            Authorization:`Bearer ${token}`
                        }
                    }
                );
            const formatted =
            res.data.map(m => ({
                sender:
                    m.senderId === currentUserId
                        ? "You"
                        : m.senderName,
                text:
                    m.message
            }));
            setAllMessages(prev => ({
                ...prev,
                [activeFriend.id]:
                    formatted
            }));
        }
        catch (err)
        {
            console.error(err);
        }
    };

    loadMessages();

    const markAsRead =
    async () => {
    try
    {
        const token = localStorage.getItem("token");

        await axios.post(
            `https://localhost:7022/api/messages/read/${activeFriend.id}`,
            {},
            {
                headers:
                {
                    Authorization:`Bearer ${token}`
                }
            }
        );

        setUnreadCount(0);
    }

    catch (err)
    {
        console.error(err);
    }
};

markAsRead();

}, [activeFriend]);

    const sendMessage = async () => {
        if (!input.trim() || !activeFriend || !connection) return;

        const token =
            localStorage.getItem("token");

        const decoded =
            JSON.parse(
                atob(token.split('.')[1])
            );

        const currentUser = {

            id:
            decoded[
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            ],

            username:
                decoded.unique_name
        };
        console.log(currentUser);

        await connection.invoke(
            "SendMessageToFriend",
            activeFriend.id.toString(),
            currentUser.id,
            currentUser.username,
            input
        );

        setAllMessages(prev => ({...prev,
            [activeFriend.id]: [
                ...(prev[activeFriend.id] || []),
                { sender: "You", text: input }
            ]
        }));

        setInput("");
    };

    const currentMessages = activeFriend ? (allMessages[activeFriend.id] || []) : [];

    return (
        <div className="friends-chat-container">
            {/* Friends List */}
            <div className="friends-list">
                <div className="friends-list-title">Friends</div>
                {friends.length === 0 && (
                    <p className="no-friends">No friends yet.</p>
                )}
                {friends.map(f => (
                    <div
                        key={f.id}
                        className={`friend-item ${activeFriend?.id === f.id ? "active" : ""}`}
                        onClick={() => setActiveFriend(f)}
                    >
                        <div className="friend-avatar">
                            {f.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="friend-info">
                            <div className="friend-username">@{f.username}</div>
                            <div className="friend-name">{f.name}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Chat Panel */}
            <div className="dm-panel">
                {!activeFriend ? (
                    <div className="dm-empty">
                        <span>👈 Select a friend to chat</span>
                    </div>
                ) : (
                    <>
                        <div className="dm-header">
                            <div className="dm-avatar">
                                {activeFriend.username?.charAt(0).toUpperCase()}
                            </div>
                            <span>@{activeFriend.username}</span>
                        </div>

                        <div className="dm-messages">
                            {currentMessages.map((m, i) => (
                                <div
                                    key={i}
                                    className={`dm-bubble ${m.sender === "You" ? "mine" : "theirs"}`}
                                >
                                    {m.text}
                                </div>
                            ))}
                        </div>

                        <div className="dm-input-row">
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && sendMessage()}
                                placeholder="Type a message..."
                                className="dm-input"
                            />
                            <button className="dm-send-btn" onClick={sendMessage}>
                                ➤
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default FriendsChat;