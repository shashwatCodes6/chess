import React, { useState, useCallback, useEffect } from "react";
import { socket } from './socket';

function RoomGen() {
  const [value, setVal] = useState('');
  const [link, setLink] = useState('');
  const makeid = useCallback(() => {
    const length = 6;
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    socket.emit("join-room", result);
    const roomLink = window.location.origin + '/join/' + result;
    setVal(result);
    setLink(roomLink);
  }, []); // Empty dependency array means the function is only created once.
  
  return (
    <div>
        <h1>Room</h1>
      <input id="roomID" placeholder="Your Room ID" value = {value} /> <br></br>
      <button onClick={makeid}>Generate Room!</button><br></br>
      <a href = {link} > { link } </a>
    </div>
  );
}

export default RoomGen;
