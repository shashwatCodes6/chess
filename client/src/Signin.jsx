import React from 'react'
import Cookies from 'js-cookie'
import { redirect } from 'react-router-dom'
import { useState } from 'react'



const Signin = function(){
    console.log(Cookies.get())
    function handleSubmit(){

    }
    return (
        <div>
            <input placeholder='Enter username' id = "username"></input><br></br>
            <input placeholder='Enter password' id = "password" type = "password"></input><br></br>
            <button onClick = {handleSubmit}>Submit</button>
        </div>
    )
}

export default Signin;