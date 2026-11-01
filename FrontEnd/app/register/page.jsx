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
const [alertDanger , setAlert] = useState({
    isTrue  : false,
    message : ""
})
const [succesLoginAlert , setSuccesLoginAlert] = useState({
    isTrue : false,
    message : ""
})


const InputRefNAME = useRef();
const InputRefPASSWORD = useRef();
const InputRefEMAİL = useRef();
const InputRefFULLNAME = useRef();

const registerButton =  async (e) => {
    e.preventDefault() 

    console.log(mail.split("@")[1]);

    if(!name || !mail || !password || !fullName){
        setAlert({isTrue : true , message : "Bilgiler Eksiksiz Girilmelidir !"})

        setTimeout(() => {
            setAlert({isTrue : false , message : ""})
        }, 2000);

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
        
        
        setAlert({isTrue : true , message : "Geçersiz e-posta. Gmail, Hotmail veya iCloud kullan"})

        setTimeout(() => {
            setAlert({isTrue : false , message : ""})
        },2000)

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
    

    if(!data.success){
        
        setAlert({isTrue : true , message : data.error.message})

        setTimeout(() => {
            setAlert({isTrue : false , message : ""})
        },2000)
        
        return;
    }

    
      if(data.success && name && mail && password && fullName){
        setSuccesLoginAlert({isTrue : true , message : "Hesabınız Başarıyla Oluşturuldu !"})

        setTimeout(() => {
            setSuccesLoginAlert({isTrue : false, message : ""})
            Router.push("/login")
        }, 2500);
        
        return;
        
    }
    
}

    return(
    <div className="register">

        {alertDanger.isTrue &&  (<div className="alert theme-danger dangerAlert" role="alert">
            <p>{alertDanger.message}</p>
        </div>)}

        {succesLoginAlert.isTrue && (
            <div className="alert theme-success succesAlert" role="alert">
            <p>{succesLoginAlert.message}</p>
        </div>
        
        )}
        
     
        <form className = "formCard" onSubmit={registerButton} action="">
            <div className="personalInputs">
               
                
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