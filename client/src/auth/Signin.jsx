import React, { useEffect } from 'react'
import Cookies from 'js-cookie'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

import {REACT_APP_SERVER_URL} from '../config'
import Nav from '../components/Nav'

const Signin = function(){
    const [shouldRedirect, setRedirect] = useState(false);
    var [uname, setUname] = useState()
    var [password, setPass] = useState()
    let [tokeninBrowser, setToken] = useState(Cookies.get());
    const navigate = useNavigate();


    useEffect(() => {
        setToken({token : Cookies.get().token});
        if(tokeninBrowser.token !== "") {
            fetch(`${REACT_APP_SERVER_URL}/verifyToken`, {
                method : "POST", 
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(tokeninBrowser),
            })
            .then((response) => {
                return response.json();   
            }).then((data) => {
                console.log(data);
                if(data.msg === "Success"){
                    setRedirect(true);
                }else{
                    Cookies.set('token');
                    Cookies.set('username');
                }
            })
        }
    }, [])
    
    function handleSubmit(){
        const obj = {
            password : password,
            username : uname
        };
      //  console.log(obj);
        
        fetch(`${REACT_APP_SERVER_URL}/login`, {
            method : "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(obj),
        })
            .then(response =>{
                if(response.status === 400){
                    alert("User does not exist!");
                }
                return response.json();
            }).then(data => {
                if(data.token){
                    console.log(data.token);
                    Cookies.set('token', data.token, { expires : 7 });
                    Cookies.set('username', uname, { expires : 7 });
                    setRedirect(true);
                }else{
                    alert(data.msg);
                }
            })
            .catch(err => {
                console.log(err);
            })
    }
    useEffect(()=>{
        if(shouldRedirect){
            navigate("/roomGen");
        }
    }, [shouldRedirect]);
    return (
        <>
        <Nav/>
        <div className="grid grid-cols-3">
            <div className="col-span-1"></div>
            <div className="col-span-1 flex flex-col items-center justify-center" >

            <h1 className="text-3xl font-bold text-center p-10">Signin</h1>
            <input className = "text-black border border-black p-2" onChange = {e => setUname(e.target.value)} placeholder = "UserName" /> <br></br>
            <input className = "text-black border border-black p-2" onChange = {e => setPass(e.target.value)} placeholder = "Password" id = "password" /> <br></br>
            <button className = "border border-gray-100 p-2 hover:bg-gray-500" type="button"  onClick = {handleSubmit}>Submit!</button><br></br>
            </div>
            <div className="col-span-2"></div>

        </div>
        </>
    );
}

export default Signin;