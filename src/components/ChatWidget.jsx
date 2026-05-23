import { useEffect, useState } from "react";
import "../styles/ChatWidget.css";
import Draggable from "react-draggable";
import axios from "axios";
import {FaCheck,FaTimes} from "react-icons/fa";
import FriendsChat from "./FriendsChat";
import {useSignalR}from "../pages/SignalRProvider";

import * as signalR from "@microsoft/signalr";

function ChatWidget() {
  const connection = useSignalR();

  const [isOpen, setIsOpen] = useState(false);

  const [messages, setMessages] = useState([]);

  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");

  const [users, setUsers] = useState([]);

  const [activeTab, setActiveTab] = useState("search");

  const [friendRequests, setFriendRequests] = useState([]);

  const [friends, setFriends] = useState([]);

  const [notifications, setNotifications] = useState([]);

  const [notifCount, setNotifCount] = useState(0);

  useEffect(() =>
  {
    const searchUsers =
      async () =>
    {
      // Empty input
      if (search.trim() === "")
      {
        setUsers([]);
        return;
      }

      try
      {
        const token =
          localStorage.getItem("token");

        const res =
          await axios.get(

            `https://localhost:7022/api/users/search?query=${search}`,

            {
              headers:
              {
                Authorization:
                  `Bearer ${token}`
              }
            }
          );

        setUsers(res.data);
      }

      catch (err)
      {
        console.error(err);
      }
    };

    // Debounce
    const timer =
      setTimeout(
        searchUsers,
        400);

    return () =>
      clearTimeout(timer);

  }, [search]);

  useEffect(() => {

  if (!connection)
    return;

  connection.start()
    .then(() => {
      console.log("Connected");

      // JOIN USER GROUP
      const token =
        localStorage.getItem("token");

      if (token)
    {
      const decoded =
        JSON.parse(
          atob(token.split('.')[1])
        );

      console.log(decoded);

      const userId =
        decoded[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ];

      console.log("USER ID:", userId);

      connection.invoke("JoinUserGroup",userId);
    }
      // NORMAL CHAT MESSAGE
      connection.on(
        "ReceiveMessage",
        (user, message) => {
          setMessages(prev => [
            ...prev,
            {
              user,
              message
            }
          ]);
        }
      );

      // NOTIFICATIONS
      connection.on(
        "ReceiveNotification",
        (type, message) => {
          setNotifications(prev => [
            ...prev,
            {
              type,
              message,
              id: Date.now()
            }
          ]);
          setNotifCount(prev =>
            prev + 1
          );
        }
      );

      // FRIEND LIST LIVE UPDATE
      connection.on(
        "FriendAdded",
        () =>
        {
          loadFriends();
        }
      );

    })

    .catch(err => {

      console.error(err);
    });

}, [connection]);

  useEffect(() =>
  {
    const loadRequests =
      async () =>
    {
      try
      {
        const token = localStorage.getItem("token");

        const res =
          await axios.get(

            "https://localhost:7022/api/users/friend-requests",
            {
              headers:
              {
                Authorization:
                  `Bearer ${token}`
              }
            }
          );

        setFriendRequests(
          res.data);
      }

      catch (err)
      {
        console.error(err);
      }
    };

    if (activeTab === "requests")
    {
      loadRequests();
    }
    if (activeTab === "chat")
    {
      loadFriends();
    }
  }, [activeTab]);

  const sendMessage = async () => {

    if (!message.trim())
      return;

    await connection.invoke(
      "SendMessage",
      "Kaushik",
      message
    );

    setMessage("");
  };


  const sendFriendRequest = async (receiverId) =>
{
  try
  {
    const token =
      localStorage.getItem(
        "token");

    await axios.post(

      `https://localhost:7022/api/users/friend-request?receiverId=${receiverId}`,

      {},

      {
        headers:
        {
          Authorization:
            `Bearer ${token}`
        }
      }
    );
  }

  catch (err)
  {
    console.error(err);
    alert("Could not send request");
  }
};


const handleAccept = async (requestId) => {
  try {

    const token = localStorage.getItem("token");
    await axios.post(
      `https://localhost:7022/api/users/accept?requestId=${requestId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    // remove accepted request from UI
    setFriendRequests(prev => prev.filter(r => r.id !== requestId));

  } catch (err) {
    console.error(err);
  }
};

const handleReject = async (requestId) => {
    try {
        const token = localStorage.getItem("token");
        await axios.post(
            `https://localhost:7022/api/users/reject`,
            requestId, // send as raw body since backend uses [FromBody] Guid
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );
        setFriendRequests(prev => prev.filter(r => r.id !== requestId)); // was setRequests
    } catch (err) {
        console.error(err);
    }
};

const loadFriends = async () => {

  try {

    const token =
      localStorage.getItem("token");

    const res =
      await axios.get(
        "https://localhost:7022/api/users/friends",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

    setFriends(res.data);

  } catch (err) {

    console.error(err);
  }
};


  return (

    <div className="chat-widget">
      {
        !isOpen && (

          <button
            className="chat-toggle"

            onClick={() =>
              setIsOpen(true)
            }
          >
            Chat
          </button>
        )
      }

      {
  isOpen && (

    <div className="chat-window">
      <div className="chat-container">
        {/* SIDEBAR */}
        <div className="chat-sidebar">
          <div
            className={
              activeTab === "search"
                ? "sidebar-item active"
                : "sidebar-item"
            }
            onClick={() =>
              setActiveTab("search")
            }
          >
            🔍
          </div>
          <div
            className={
              activeTab === "requests"
                ? "sidebar-item active"
                : "sidebar-item"
            }
            onClick={() =>setActiveTab("requests")}
          >
            👥
          </div>

          <div
              className={activeTab === "notifications" ? "sidebar-item active" : "sidebar-item"}
              onClick={() => { setActiveTab("notifications"); setNotifCount(0); }}
              style={{ position: "relative" }}
          >
              🔔
              {notifCount > 0 && (
                  <span style={{
                      position: "absolute", top: 4, right: 4,
                      background: "red", color: "white",
                      borderRadius: "50%", width: 16, height: 16,
                      fontSize: 10, display: "flex",
                      alignItems: "center", justifyContent: "center"
                  }}>
                      {notifCount}
                  </span>
              )}
          </div>


          <div
            className={
              activeTab === "chats"
                ? "sidebar-item active"
                : "sidebar-item"
            }

            onClick={() =>
              setActiveTab("chats")
            }
          >
            💬
          </div>

        </div>

        {/* MAIN */}

        <div className="chat-main">

          <div className="chat-header">

            <h3>Movie Chat</h3>

            <button
              onClick={() =>
                setIsOpen(false)
              }
            >
              X
            </button>

          </div>

          {/* SEARCH TAB */}

          {
            activeTab === "search" && (

              <>

                <div className="chat-search-container">

                  <input
                    type="text"
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    className="chat-search"
                  />

                  <div className="search-results">

                    {
                      users.map(user => (

                        <div
                          key={user.id}
                          className="search-user"
                        >

                          <div className="search-user-left">

                            <div className="search-avatar">

                              {
                                user.username
                                  ?.charAt(0)
                                  .toUpperCase()
                              }

                            </div>

                            <div className="search-user-info">

                              <div className="search-username">
                                @{user.username}
                              </div>

                              <div className="search-name">
                                {user.name}
                              </div>

                            </div>

                          </div>

                          <button
                            className={
                              user.alreadyFriends
                                ? "friend-btn friends"

                                : user.requestSent
                                  ? "friend-btn sent"

                                  : "friend-btn"
                            }

                            disabled={
                              user.requestSent ||
                              user.alreadyFriends
                            }

                            onClick={() =>
                              sendFriendRequest(user.id)
                            }
                          >
                            {
                              user.alreadyFriends
                                ? "Friends"
                                : user.requestSent
                                  ? "Request Sent"
                                  : "Add Friend"
                            }
                          </button>
                        </div>
                      ))
                    }

                  </div>

                </div>

              </>
            )
          }

          {/* REQUESTS TAB */}

          {
  activeTab === "requests" && (

    <div className="requests-panel">
      <h3>Friend Requests</h3>
      <div className="requests-list">
        {
          friendRequests.map(user => (
            <div
              key={user.id}
              className="search-user"
            >
              <div className="search-user-left">
                <div className="search-avatar">
                  {
                    user.username
                      ?.charAt(0)
                      .toUpperCase()
                  }
                </div>
                <div className="search-user-info">
                  <div className="search-username">
                    @{user.username}
                  </div>
                  <div className="search-name">
                    {user.name}
                  </div>
                </div>
              </div>
              <div className="request-actions">
                <button
                  className="accept-btn"
                  onClick={() =>
                    handleAccept(user.id)
                  }
                >
                  <FaCheck />
                </button>
                <button
                  className="reject-btn"
                  onClick={() => handleReject(user.id)}
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

  {
    activeTab === "notifications" && (

      <div className="requests-panel">

        <h3>Notifications</h3>
        {
          notifications.length === 0 && (
            <p
              style={{
                color: "#999",
                marginTop: 10
              }}
            >
              No notifications yet.
            </p>
          )
        }

        {
          notifications.map(n => (
            <div
              key={n.id}
              style={{
                background:
                  n.type === "accepted"
                    ? "#1a3a2a"
                    : "#3a1a1a",
                borderRadius: 10,
                padding: "12px 16px",
                marginBottom: 10,
                color: "white",
                fontSize: 14
              }}
            >
              {
                n.type === "accepted"
                  ? "✅"
                  : "❌"
              }
              {" "}

              {n.message}
            </div>
          ))
        }
      </div>
    )          
  }

          {/* CHATS TAB */}

          {activeTab === "chats" && (
              <FriendsChat connection={connection} />
          )}
        </div>
      </div>
    </div>
  )
}
    </div>
  );
}

export default ChatWidget;