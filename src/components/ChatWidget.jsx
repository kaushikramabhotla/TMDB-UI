import { useEffect, useState } from "react";
import "../styles/ChatWidget.css";
import Draggable from "react-draggable";

import * as signalR
  from "@microsoft/signalr";

function ChatWidget() {

  const [isOpen, setIsOpen]
    = useState(false);

  const [connection, setConnection]
    = useState(null);

  const [messages, setMessages]
    = useState([]);

  const [message, setMessage]
    = useState("");

  useEffect(() => {

    const newConnection =
      new signalR.HubConnectionBuilder()

        .withUrl(
          "https://localhost:7022/chatHub"
        )

        .withAutomaticReconnect()

        .build();

    setConnection(newConnection);

  }, []);

  useEffect(() => {

    if (!connection)
      return;

    connection.start()

      .then(() => {

        console.log("Connected");

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
      })

      .catch(err => {

        console.error(err);
      });

  }, [connection]);

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

            <div className="chat-header">

              <h3>
                Movie Chat
              </h3>

              <button
                onClick={() =>
                  setIsOpen(false)
                }
              >
                X
              </button>

            </div>

            <div className="chat-messages">

              {
                messages.map((m, index) => (

                  <div
                    key={index}
                    className="chat-message"
                  >

                    <strong>
                      {m.user}
                    </strong>

                    : {m.message}

                  </div>
                ))
              }

            </div>

            <div className="chat-input-row">

              <input
                type="text"
                value={message}
                onChange={(e) =>
                  setMessage(e.target.value)
                }
              />

              <button
                onClick={sendMessage}
              >
                Send
              </button>

            </div>

          </div>
        )
      }

    </div>
  );
}

export default ChatWidget;