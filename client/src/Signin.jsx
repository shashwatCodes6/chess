import React, { useEffect } from 'react'
import Cookies from 'js-cookie'
import { redirect } from 'react-router-dom'
import { useState } from 'react'



const Signin = function(){
    const [shouldRedirect, setRedirect] = useState(false);
    var [uname, setUname] = useState()
    var [password, setPass] = useState()
    let [tokeninBrowser, setToken] = useState(null);
    useEffect(() => {
        setToken(Cookies.get().token);
    }, [])
    if(tokeninBrowser) {
        fetch("http://localhost:3000/verifyToken")
        .then((response) => {
            return response.json();   
        }).then((data) => {
            if(data.message === "Success"){
                setRedirect(true);
            }else{
                Cookies.remove('token');
            }
        })
    }
    function handleSubmit(){
        const obj = {
            password : password,
            username : uname
        };
      //  console.log(obj);
        
            fetch("http://localhost:3000/login", {
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
                    console.log(data);
                    if(data.token){
                        Cookies.set('token', data.token, { expires: 7 });
                        setRedirect(true);
                    }else{
                        alert(data.msg);
                    }
                })
                .catch(err => {
                    console.log(err);
                })
    }
    if(shouldRedirect){
        window.location.replace("http://localhost:5173/roomGen");
        return redirect("/roomGen");
    }
    return (
        <div>
            <input onChange = {e => setUname(e.target.value)} placeholder = "UserName" id = "username"></input><br></br>
            <input onChange = {e => setPass(e.target.value)} placeholder = "Password" id = "password"></input><br></br>
            <button type = "submit" onClick = {handleSubmit}>Submit</button>
         </div>
    )
}

export default Signin;