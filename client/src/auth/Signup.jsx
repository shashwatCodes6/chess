import React, { useEffect } from 'react'
import zod from 'zod'
import { socket } from '../socket/socket';
import { useState } from 'react'
import Cookies from 'js-cookie'
import { useNavigate } from 'react-router-dom'
import {REACT_APP_SERVER_URL} from '../config'
import Nav from '../components/Nav';

const schema = zod.object({
    name : zod.string(),
    password : zod.string().min(6),
    email : zod.string().email(),
    username : zod.string()
});



const Signup = function(){
    const[shouldRedirect, setRedirect] = useState(false);
    var [name,setName] = useState()
    var [password, setPass] = useState()
    var [email, setEmail] = useState()
    var [uname, setUname] = useState()
    const navigate = useNavigate();


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
            fetch(`${REACT_APP_SERVER_URL}/signup`, {
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
                    return response.json();
                }).then(data => {
                    //console.log( " data ", data);
                    if(data.token){
                        Cookies.set('token', data.token, { expires: 7 });
                        Cookies.set('username', uname, { expires: 7 });
                        setRedirect(true);
                    }
                })
                .catch(err => {
                    console.log(err);
                })
        }
        if(shouldRedirect){
            navigate("/login");
        }
    }
        return (
            <>
                <Nav/>
            <div className="grid grid-cols-3">
                <div className="col-span-1"></div>
                <div className="col-span-1 flex flex-col items-center justify-center" >
    
                <h1 className="text-3xl font-bold text-center p-10">Sign Up</h1>
                <input className = "text-black border border-black p-2" onChange = {e => {setName(e.target.value)}} placeholder = "Name" id = "name" required /> <br></br>
                <input className = "text-black border border-black p-2" onChange = {e => setEmail(e.target.value)} placeholder = "Email ID" id = "email" type = "email" required /> <br></br>
                <input className = "text-black border border-black p-2" onChange = {e => setUname(e.target.value)} placeholder = "User Name" id = "username" required /> <br></br>
                <input className = "text-black border border-black p-2" onChange = {e => setPass(e.target.value)} placeholder = "Password" id = "password" required /> <br></br>
                <button className = "border border-gray-100 p-2 hover:bg-gray-500" type="button"  onClick = {handleSubmit}>Submit!</button><br></br>
                </div>
                <div className="col-span-2"></div>
    
            </div>

            </>
        );
      
    
}

export default Signup