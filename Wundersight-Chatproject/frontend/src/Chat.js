import React, { useState, useEffect } from "react";
import "./Chat.css";
import ScrollToBottom from "react-scroll-to-bottom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faCheckDouble } from "@fortawesome/free-solid-svg-icons";

function Chat({ socket, username, room }) {
  const [viewingHistory, setViewingHistory] = useState(false);
  const [currentmessage, setCurrentmessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editedMessageText, setEditedMessageText] = useState("");

  //togel for viewing history

  const toggleMessageHistory = () => {
    setViewingHistory(!viewingHistory);

    if (!viewingHistory) {
      socket.emit("request_history", room);
    } else {
      setMessageList([]);
    }
  };

  //send message to chat and update functionality

  const sendMessage = async () => {
    if (currentmessage !== "") {
      const now = new Date();
      const messageData = {
        id: Date.now(),
        room: room,
        author: username,
        message: currentmessage,
        time: now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        onlineStatus: "online",
      };
      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, { ...messageData, delivered: false }]);
      setCurrentmessage("");
    }
  };

  //editing message text

  const startEditingMessage = (messageId, initialText) => {
    setEditingMessage(messageId);
    setEditedMessageText(initialText);
  };

  const cancelEditing = () => {
    setEditingMessage(null);
    setEditedMessageText("");
  };

  const saveEditedMessage = async () => {
    if (editedMessageText !== "") {
      await socket.emit("edit_message", {
        room,
        messageId: editingMessage,
        editedMessage: editedMessageText,
      });

      setMessageList((list) =>
        list.map((msg) =>
          msg.id === editingMessage
            ? { ...msg, message: editedMessageText }
            : msg
        )
      );

      cancelEditing();
    }
  };

  //delete edited message and message functionlity

  const deleteSelectedMessages = async () => {
    const selectedIds = selectedMessages.map((msg) => msg.id);
    await socket.emit("delete_messages", { room, messageIds: selectedIds });
    setMessageList((list) =>
      list.filter((msg) => !selectedIds.includes(msg.id))
    );
    setSelectedMessages([]);
  };

  // selected message checkbox function
  const toggleSelectMessage = (messageId) => {
    const isSelected = selectedMessages.some((msg) => msg.id === messageId);
    if (isSelected) {
      setSelectedMessages((selected) =>
        selected.filter((msg) => msg.id !== messageId)
      );
    } else {
      const selectedMessage = messageList.find((msg) => msg.id === messageId);
      setSelectedMessages((selected) => [...selected, selectedMessage]);
    }
  };

  //dubble tick message deliverd functionality
  const acknowledgeDelivery = async (messageId) => {
    await socket.emit("acknowledge_delivery", { room, messageId });
    setMessageList((list) =>
      list.map((msg) =>
        msg.id === messageId ? { ...msg, delivered: true } : msg
      )
    );
  };

  // useeffect for reciving functionality
  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, { ...data, delivered: false }]);
    });

    // useeffect deleverd functionality
    socket.on("message_delivered", (deliveredMessageId) => {
      setMessageList((list) =>
        list.map((msg) =>
          msg.id === deliveredMessageId ? { ...msg, delivered: true } : msg
        )
      );
    });
    //useeffect history functionality
    socket.on("receive_history", (history) => {
      if (viewingHistory) {
        setMessageList(history);
      }
    });

    return () => {
      socket.off("receive_message");
      socket.off("message_delivered");
      socket.off("receive_history");
    };
  }, [socket, viewingHistory]);

  //use effect delevery status
  const renderDeliveryStatus = (message) => {
    if (message.delivered) {
      return (
        <p
          className="delivery__btn"
          onClick={() => acknowledgeDelivery(message.id)}
        >
          Delivery
        </p>
      );
    } else {
      return <FontAwesomeIcon className="checkbubble" icon={faCheckDouble} />;
    }
  };

  return (
    <>
      <div className="chat__main">
        <div className="chat-window">
          <div className="chat-header">
            <h2 style={{ marginBottom: "10px" }}>Wundrsight Chat App</h2>
          </div>
          <button onClick={toggleMessageHistory}>
            {viewingHistory ? "Close History" : "View History"}
          </button>
          <div className="chat-body">


            <ScrollToBottom
              className={`message-container ${viewingHistory ? "visible" : "hidden"
                }`}
            >
              {messageList.map((messageContent) => {
                const isEditing = editingMessage === messageContent.id;
                return (
                  <div
                    key={messageContent.id}
                    className={`message ${isEditing ? "editing-message" : ""} ${viewingHistory ? "viewing-history" : ""
                      }`}
                    id={username === messageContent.author ? "you" : "other"}
                  >
                    <div className="message-content">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedMessageText}
                          onChange={(e) => setEditedMessageText(e.target.value)}
                        />
                      ) : (
                        <p>{messageContent.message}</p>
                      )}
                    </div>
                    <div className="message-meta">
                      <p id="author">{messageContent.author}</p>
                      <p id="time">{messageContent.time}</p>
                      {messageContent.onlineStatus && (
                        <div className="online-status-dot">
                          <div
                            className={
                              messageContent.onlineStatus === "online"
                                ? "online-dot"
                                : "offline-dot"
                            }
                          ></div>
                        </div>
                      )}
                      {renderDeliveryStatus(messageContent)}
                      <input
                        type="checkbox"
                        onChange={() => toggleSelectMessage(messageContent.id)}
                      />
                      <button
                        className="delete__btn"
                        onClick={() => deleteSelectedMessages("")}
                      >
                        <FontAwesomeIcon icon={faTrash} />{" "}
                      </button>
                    </div>
                    {isEditing ? (
                      <>
                        <button onClick={saveEditedMessage}>Save</button>
                        <button onClick={cancelEditing}>Cancel</button>
                      </>
                    ) : (
                      <p
                        className="edit__btn"
                        onClick={() =>
                          startEditingMessage(
                            messageContent.id,
                            messageContent.message
                          )
                        }
                      >
                        Edit
                      </p>
                    )}
                  </div>
                );
              })}
            </ScrollToBottom>
          </div>
          <div className="typing__box">
            <input
              className="typ__input"
              type="text"
              value={currentmessage}
              placeholder="Write message here...."
              onChange={(event) => {
                setCurrentmessage(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  sendMessage();
                }
              }}
            />
            <button className="Send__btn" onClick={sendMessage}>
              Send &#9658;
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Chat;
