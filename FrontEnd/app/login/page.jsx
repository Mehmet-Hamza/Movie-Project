"use client"

import { useState } from "react"
import styles from "./login.css"
import Link from "next/link"


export default function login(){
    
   // const Router = useRouter()
    const [identifier , setİdenTifier] = useState("");
    const [password , setPassword] = useState("");

   
    const loginAuth = async (e) => {
        e.preventDefault()
        const res = await fetch(`http://localhost:4000/api/auth/login`,{
            method : "POST",
            headers : {'Content-Type' : 'application/json'},
            body : JSON.stringify({identifier , password})
        })
        const data = await res.json();
        console.log(data);

        if(data.success){
            
            document.cookie = `token=${data.data.token}; path=/; max-age=604800; SameSite=Lax`;
            document.cookie = `name=${data.data.user.username}; path=/; max-age=604800; SameSite=Lax`;

            window.location.href = "/";

        }
    }
    
    
    return(
    <div className="login">
        <form className="formCard" onSubmit={loginAuth} action="">
            <div className="emailCard">
                <input className="loginInput" placeholder="Kullanıcı adı" onChange={(e) => {setİdenTifier(e.target.value)}} type="text" />
            </div>

            <div className="passwordCard">
                <input className="loginInput" placeholder="Şifre" onChange={(e) => {setPassword(e.target.value)}} type="text" />
            </div>

            <div className="submitCard">
                <button className="submit" type="submit">Giriş Yap</button>
            </div>

            <div className="registerRouterCard">
                <p style={{color : 'white'}}>Hesabın yok mu?</p>
                
                <Link className="registerRouter" href={"/register"}>Kayıt Ol</Link>
            </div>
        </form>
    </div>
    )
}