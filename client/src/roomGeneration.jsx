import React, { useState, useCallback, useEffect } from "react";
import { socket } from './socket';
import Cookies from 'js-cookie'
import { useNavigate } from 'react-router-dom';

function RoomGen() {
  const [value, setVal] = useState('');
  const [link, setLink] = useState('');
  const tokeninBrowser = Cookies.get();
  const navigate = useNavigate();

  useEffect(() => {
    if(!tokeninBrowser){
      navigate("/login");
    }
    fetch("http://localhost:3000/verifyToken", {
      method : "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tokeninBrowser),
    }) 
    .then((response) => {
      return response.json();
    }).then(data => {
      if(data.msg === "Success"){
        console.log(data);
      }else{
        alert("Not authenticated!!");
        navigate("/login");
      }
    })
  }, []);
  const makeid = useCallback(() => {
    const length = 6;
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter++;
    }
  //  socket.emit("join-room", result);
    const roomLink = window.location.origin + '/join/' + result;
    setVal(result);
    setLink(roomLink);
  }, []); // Empty dependency array means the function is only created once.
  
  return (
    <div className="row ">
    <div className="col col-4"></div>
    <div className="col col-4 flex justify-content-center align-items-center" >

      <h1>Room</h1>
      <input id="roomID" placeholder="Your Room ID" value = {value} /> <br></br>
      <button type="button" className="btn btn-dark m-4" onClick={makeid}>Generate Room!</button><br></br>
      <a href = {link}> { link } </a>
    </div>
    <div className="col col-4"></div>

    </div>
  );
}

export default RoomGen;
