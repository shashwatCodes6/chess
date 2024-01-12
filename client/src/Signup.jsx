import React, { useEffect } from 'react'
import zod from 'zod'
import { socket } from './socket';
import { useState } from 'react'
import Cookies from 'js-cookie'
import { redirect } from 'react-router-dom'


const schema = zod.object({
    name : zod.string(),
    password : zod.string().min(6),
    email : zod.string().email(),
    username : zod.string()
});



const Signup = function(){
    const[shouldRedirect, setRedirect] = useState(true);
    var [name,setName] = useState()
    var [password, setPass] = useState()
    var [email, setEmail] = useState()
    var [uname, setUname] = useState()
    const handleSubmit = () => {
        
        const obj = {
            name : name,
            password : password,
            email : email,
            username : uname
        };
        console.log(obj);
        const response = schema.safeParse(obj);
        if(!response.success){
            alert("Invalid input!!");
        }else{
            fetch("http://localhost:3000/signup", {
                method : "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(obj),
            })
                .then(response =>{
                    if(response.status !== 200){
                        alert("User already exists!");
                    }
                        //redirect("/login");
                    return response.json();
                }).then(data => {
                    console.log(data);
                    // if(data.token)
                    //     Cookies.set('token', data.token, { expires: 7 });
                    setRedirect(true);
                })
                .catch(err => {
                    console.log(err);
                })
        }
        window.location.replace("http://localhost:5173/login");

    }
    return (
        <>
            <input onChange = {e => {setName(e.target.value)}} placeholder = "Name" id = "name"></input><br></br>
            <input onChange = {e => setEmail(e.target.value)} placeholder = "Email ID" id = "email" type = "email"></input><br></br>
            <input onChange = {e => setUname(e.target.value)} placeholder = "User Name" id = "username"></input><br></br>
            <input onChange = {e => setPass(e.target.value)} placeholder = "Password" id = "password"></input><br></br>
            <button type = "submit" onClick = {handleSubmit}>Submit</button>
        </>    
    );
}

export default Signup