import React, { useState, useCallback, useEffect } from "react";
import { socket } from './socket';
import Cookies from 'js-cookie'
import { useNavigate } from 'react-router-dom';
import { DropdownMenu } from '@radix-ui/react-dropdown-menu';


function RoomGen() {
  const [value, setVal] = useState('');
  const [link, setLink] = useState('');
  const [timer, setTimer] = useState(0);
  const [inc, setInc] = useState(0);
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
    <div className="grid grid-cols-3">
    <div className="col-span-1"></div>
    <div className="col-span-1 flex flex-col items-center justify-center" >

      <h1 className="text-5xl font-bold text-center p-10">Room</h1>
      <input className = "border border-gray-100 p-2 text-black" id="roomID" placeholder="Your Room ID" value = {value} /> <br></br>
    
      
        <select className = "border border-gray-100 p-2 text-black" id="time" value={timer} onChange={e => {setTimer(parseInt(e.target.value));}}>
          <option id = "1">1</option>
          <option id = "2">2</option>
          <option id = "5">5</option>
          <option id = "10">10</option>
        </select>
        <select className = "border border-gray-100 p-2 text-black" id="increment" value={inc} onChange={e => setInc(parseInt(e.target.value))}>
          <option id = "1">1</option>
          <option id = "2">2</option>
          <option id = "5">5</option>
        </select>
      <button className = "border border-gray-100 p-2 hover:bg-gray-400" type="button"  onClick={async ()=>{
        makeid();
        socket.emit("createRoom", {
          roomID : value,
          timingControls : {
            time : timer,
            inc : inc
          }
        });
      }}>Generate Room!</button><br></br>
      <a className = "text-blue-400 p-5" href = {link}> { link } </a>
    </div>
    <div className="col-span-2"></div>
    </div>
  );
}

export default RoomGen;
