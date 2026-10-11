"use client"

import { useState } from "react"
import styles from "../login/login.css"

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
    <div className="register">
        <form className = "formCard" onSubmit={registerButton} action="">
            <div className="personalInputs">
                <div className="UserNameInput">
                    <input type="text" className="registerInput" onChange={(e) => {setName(e.target.value)}} placeholder="Kullanıcı Adı"/>
                </div>

                <div className="emailInput">
                    <input type="email" className="registerInput" onChange={(e) => {setMail(e.target.value)}} placeholder="E-posta"/>
                </div>

                <div>
                    <input type="text" className="registerInput" onChange={(e) => {setPassword(e.target.value)}} placeholder="Şifre"/>
                </div>

                <div>
                    <input type="text" className="registerInput" onChange={(e) => {setFullName(e.target.value)}} placeholder="Tam İsim" />
                </div>

                <div className="registerButton">
                    <button className="registerBtn" type="submit">Kayıt Ol</button>
                </div>
            </div>
        </form>
    </div>
    )
}