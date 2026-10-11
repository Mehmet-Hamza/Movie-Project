"use client"

import { useState } from "react"

export default function register(){

const [name, setName] = useState("");
const [mail, setMail] = useState("");
const [password, setPassword] = useState("")
const [fullName , setFullName] = useState("")


const registerButton =  async (e) => {
    e.preventDefault() 
    const res = await fetch(`http://localhost:4000/api/auth/register`,{
        method : "POST",
        headers : {'Content-Type' : "application/json"},
        body : JSON.stringify({
            username : name,
            email : mail,
            password : password,
            fullName : fullName

        })

    })
    const data = await res.json()
    console.log(data);
}


    return(
        <form onSubmit={registerButton} action="">
            <div className="personalInputs">
                <div className="UserNameInput">
                    <input type="text" onChange={(e) => {setName(e.target.value)}} placeholder="name"/>
                </div>

                <div className="emailInput">
                    <input type="email" onChange={(e) => {setMail(e.target.value)}} placeholder="email"/>
                </div>

                <div>
                    <input type="text" onChange={(e) => {setPassword(e.target.value)}} placeholder="password"/>
                </div>

                <div>
                    <input type="text" onChange={(e) => {setFullName(e.target.value)}} placeholder="FullName" />
                </div>

                <div className="registerButton">
                    <button type="submit">Kayıt Ol</button>
                </div>
            </div>
        </form>
    )
}