import React, { useState } from "react";
import io from "socket.io-client";
import Chat from "./Chat";
import "./Register.css"

const socket = io.connect("http://localhost:3000");

function Register() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);

  const joinRoom = () => {
    if (username !== "" && room !== "") {
      socket.emit("join_room", room);
      setJoined(true);
    }
  };

  return (
    <div className="register__main">
      <div className="register__container">
      {!joined ? (
        <>
          <h3 style={{fontSize:"28px"}}>Register</h3>
          <input
          className="input__area"
            type="text"
            placeholder="Name..."
            onChange={(event) => {
              setUsername(event.target.value);
            }}
          />
          <input
            className="input__area"
            type="text"
            placeholder="Room ID..."
            onChange={(event) => {
              setRoom(event.target.value);
            }}
          />
          <button  className="join__btn" onClick={joinRoom}>Join</button>
        </>
      ) : (
        <Chat socket={socket} username={username} room={room} />
      )}
    </div>
    </div>
  );
}

export default Register;
