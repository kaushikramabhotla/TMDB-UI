import { useEffect, useState } from "react";
import "../styles/ChatWidget.css";
import axios from "axios";
import { FaCheck, FaTimes } from "react-icons/fa";
import FriendsChat from "./FriendsChat";
import { useSignalR } from "../pages/SignalRProvider";

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("search");
  const [friendRequests, setFriendRequests] = useState([]);

  // ✅ FIX 2: Add notification state
  const [notifications, setNotifications] = useState([]);
  const [notifCount, setNotifCount] = useState(0);
  const { connection } = useSignalR();

  // ─── Search users ───────────────────────────────────────────
  useEffect(() => {
    const searchUsers = async () => {
      if (search.trim() === "") { setUsers([]); return; }
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/search?query=${search}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUsers(res.data);
      } catch (err) { console.error(err); }
    };
    const timer = setTimeout(searchUsers, 400);
    return () => clearTimeout(timer);
  }, [search]);

  
  // ─── Load friend requests ────────────────────────────────────
  useEffect(() => {
    const loadRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/friend-requests`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFriendRequests(res.data);
      } catch (err) { console.error(err); }
    };
    if (activeTab === "requests") loadRequests();
  }, [activeTab]);

  // ─── Accept / Reject ─────────────────────────────────────────
  const handleAccept = async (request) => {
  try {
    const token = localStorage.getItem("token");
    console.log(request);
    console.log(request.id);
    console.log(request.senderId);
    await axios.post(
    `${import.meta.env.VITE_API_URL}/api/users/accept`,
      {
        requestId: request.id
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    // Remove request instantly
    setFriendRequests(prev =>
      prev.filter(
        r => r.senderId !== request.senderId
      )
    );

    // Add friend instantly
    setFriends(prev => {
      const alreadyExists =
        prev.some(
          f => f.id === request.senderId
        );
      if (alreadyExists)
      {
        return prev;
      }

      return [...prev,
        {
          id: request.senderId,
          username: request.username,
          name: request.name
        }
      ];
    });
  }
  catch (err)
  {
    console.error(err);
  }
};

  const handleReject = async (senderId) => {
    try {
      const token = localStorage.getItem("token"); // ✅ FIX: was missing token
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/reject`,
        senderId,  // [FromBody] Guid expects raw value
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      setFriendRequests(prev => prev.filter(r => r.id !== senderId));
    } catch (err) { console.error(err); }
  };

  const sendFriendRequest = async (receiverId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/friend-request?receiverId=${receiverId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Mark as sent in UI
      setUsers(prev => prev.map(u => u.id === receiverId ? { ...u, requestSent: true } : u));
    } catch (err) { console.error(err); alert("Could not send request"); }
  };

  // ─── Render ──────────────────────────────────────────────────
  return (
    <div className="chat-widget">
      {!isOpen && (
        <button className="chat-toggle" onClick={() => setIsOpen(true)}>
          Chat
          {/* Show notif badge on the toggle button too */}
          {notifCount > 0 && (
            <span style={{
              marginLeft: 6, background: "white", color: "red",
              borderRadius: "50%", width: 18, height: 18, fontSize: 11,
              display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: "bold"
            }}>{notifCount}</span>
          )}
        </button>
      )}

      {isOpen && (
        <div className="chat-window">
          <div className="chat-container">

            {/* ── SIDEBAR ── */}
            <div className="chat-sidebar">

              <div className={activeTab === "search" ? "sidebar-item active" : "sidebar-item"}
                onClick={() => setActiveTab("search")}>🔍</div>

              <div className={activeTab === "requests" ? "sidebar-item active" : "sidebar-item"}
                onClick={() => setActiveTab("requests")}>👥</div>

              <div className={activeTab === "chats" ? "sidebar-item active" : "sidebar-item"}
                onClick={() => setActiveTab("chats")}>💬</div>

              {/* ✅ FIX 3: Notifications tab with badge */}
              <div
                className={activeTab === "notifications" ? "sidebar-item active" : "sidebar-item"}
                onClick={() => { setActiveTab("notifications"); setNotifCount(0); }}
                style={{ position: "relative" }}
              >
                🔔
                {notifCount > 0 && (
                  <span style={{
                    position: "absolute", top: 4, right: 4,
                    background: "red", color: "white", borderRadius: "50%",
                    width: 16, height: 16, fontSize: 10,
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>{notifCount}</span>
                )}
              </div>
            </div>

            {/* ── MAIN ── */}
            <div className="chat-main">
              <div className="chat-header">
                <h3>Movie Chat</h3>
                <button onClick={() => setIsOpen(false)}>X</button>
              </div>

              {/* SEARCH TAB */}
              {activeTab === "search" && (
                <div className="chat-search-container">
                  <input type="text" placeholder="Search users..."
                    value={search} onChange={e => setSearch(e.target.value)}
                    className="chat-search" />
                  <div className="search-results">
                    {users.map(user => (
                      <div key={user.id} className="search-user">
                        <div className="search-user-left">
                          <div className="search-avatar">{user.username?.charAt(0).toUpperCase()}</div>
                          <div className="search-user-info">
                            <div className="search-username">@{user.username}</div>
                            <div className="search-name">{user.name}</div>
                          </div>
                        </div>
                        {
                          user.alreadyFriends
                          ?
                          (
                            <button
                              className="friend-btn friends"
                              disabled
                            >
                              Friends
                            </button>
                          )
                          :
                          (
                            <button
                              className={
                                user.requestSent
                                ? "friend-btn sent"
                                : "friend-btn"
                              }
                              disabled={user.requestSent}
                              onClick={() =>
                                sendFriendRequest(user.id)
                              }
                            >
                              {
                                user.requestSent
                                ? "Request Sent"
                                : "Add Friend"
                              }
                            </button>
                          )
                        }
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* REQUESTS TAB */}
              {activeTab === "requests" && (
                <div className="requests-panel">
                  <h3>Friend Requests</h3>
                  <div className="requests-list">
                    {friendRequests.length === 0 && (
                      <p style={{ color: "#666", fontSize: 13, marginTop: 10 }}>No pending requests.</p>
                    )}
                    {friendRequests.map(user => (
                      <div key={user.id} className="search-user">
                        <div className="search-user-left">
                          <div className="search-avatar">{user.username?.charAt(0).toUpperCase()}</div>
                          <div className="search-user-info">
                            <div className="search-username">@{user.username}</div>
                            <div className="search-name">{user.name}</div>
                          </div>
                        </div>
                        <div className="request-actions">
                          <button className="accept-btn" onClick={() => handleAccept(user)}>
                            <FaCheck />
                          </button>
                          {/* ✅ FIX: was request.id (undefined), now user.id */}
                          <button className="reject-btn" onClick={() => handleReject(user.id)}>
                            <FaTimes />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CHATS TAB */}
              {activeTab === "chats" && (
                <FriendsChat connection={connection} />
              )}

              {/* ✅ FIX 3: NOTIFICATIONS TAB */}
              {activeTab === "notifications" && (
                <div className="requests-panel">
                  <h3>Notifications</h3>
                  {notifications.length === 0 && (
                    <p style={{ color: "#666", fontSize: 13, marginTop: 10 }}>No notifications yet.</p>
                  )}
                  {notifications.map(n => (
                    <div key={n.id} style={{
                      background: n.type === "accepted" ? "#1a3a2a" : "#3a1a1a",
                      borderRadius: 10, padding: "12px 16px",
                      marginBottom: 10, color: "white", fontSize: 14
                    }}>
                      {n.type === "accepted" ? "✅" : "❌"} {n.message}
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatWidget;