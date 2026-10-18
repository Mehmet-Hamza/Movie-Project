"use client"

import { useEffect, useRef, useState } from "react"
import styles from "../login/login.css"
import { useRouter } from "next/navigation"

export default function register(){

const Router = useRouter()
const [name, setName] = useState("");
const [mail, setMail] = useState("");
const [password, setPassword] = useState("")
const [fullName , setFullName] = useState("")

const [errorType , setErrorType] = useState("")


const InputRefNAME = useRef();
const InputRefPASSWORD = useRef();
const InputRefEMAİL = useRef();
const InputRefFULLNAME = useRef();

const registerButton =  async (e) => {
    e.preventDefault() 

    console.log(mail.split("@")[1]);

    if(!name || !mail || !password || !fullName){
        alert("Bilgiler Eksiksiz Doldurulmalıdır")

        InputRefNAME.current.value = ""
        InputRefPASSWORD.current.value = ""
        InputRefEMAİL.current.value = ""
        InputRefFULLNAME.current.value = ""
        return;
        
    }

    const emailDomain = mail.trim().toLowerCase().split("@")[1];

    const allowedDomains = [
        "gmail.com",
        "hotmail.com",
        "icloud.com"
    ];
    

  


    if(!allowedDomains.includes(emailDomain)){
        
        setErrorType("Geçersiz e-posta. Gmail, Hotmail veya iCloud kullan.");

        InputRefNAME.current.value = ""
        InputRefPASSWORD.current.value = ""
        InputRefEMAİL.current.value = ""
        InputRefFULLNAME.current.value = ""

        return;

    }

   
   
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

    console.log("STATUS:", res.status);
        console.log("BACKEND CEVABI:", JSON.stringify(data, null, 2));
            console.log("MESSAGES:", data.error?.messages);

    if(!data.success){
        setErrorType(data.error.details[0].message)
        
        return;
    }

    
      if(data.success && name && mail && password && fullName){
        alert("Hesabınız Oluşturuldu !")
        Router.push("/login")
        return;
        
    }
    
}

useEffect(() => {

    const timer = setTimeout(() => {
        setErrorType("");
    },2000)

    return () => clearTimeout(timer)
},[errorType])

    return(
    <div className="register">
        <form className = "formCard" onSubmit={registerButton} action="">
            <div className="personalInputs">
                {errorType && (
                    <div className="errorCard">
                    <p style={{color : 'white'}} className="ErrorText">{errorType}</p>
                </div>
                )}
                
                <div className="UserNameInput">
                    <input ref={InputRefNAME} type="text" className="registerInput" onChange={(e) => {setName(e.target.value)}} placeholder="Kullanıcı Adı"/>
                </div>

                <div className="emailInput">
                    <input ref={InputRefEMAİL} type="email" className="registerInput" onChange={(e) => {setMail(e.target.value)}} placeholder="E-posta"/>
                </div>

                <div>
                    <input ref={InputRefPASSWORD} type="text" className="registerInput" onChange={(e) => {setPassword(e.target.value)}} placeholder="Şifre"/>
                </div>

                <div>
                    <input ref={InputRefFULLNAME} type="text" className="registerInput" onChange={(e) => {setFullName(e.target.value)}} placeholder="Tam İsim" />
                </div>

                <div className="registerButton">
                    <button className="registerBtn" type="submit">Kayıt Ol</button>
                </div>
            </div>
        </form>
    </div>
    )
}