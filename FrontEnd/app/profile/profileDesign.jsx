"use client"
import { useState , useEffect } from "react"
import { Modal, Button } from 'react-bootstrap';
import { useRouter } from "next/navigation"
import styles from "./profile.css"






export default function ProfileDesing({userName, token}) {

    const Router = useRouter()
   
    const [show, setShow] = useState(false);
    const [newFullName, setNewFullName] = useState("");
    const [newBio, setNewBio] = useState("");
    const [alert , setAlert] = useState(false);
    


    const newProfileİnfo = async () => {
        try{
            const newProfileData = await fetch(`http://localhost:4000/api/users/${userName}`,{
                method : "PATCH",
                headers : {'Content-Type' : 'application/json' , 'Authorization' : `Bearer ${token}`},
                body : JSON.stringify({
                    fullName : newFullName,
                    bio : newBio,
                    avatar : null,
                    role : "user",
                    isActive : true
                })
                

            })
            setAlert(true)

            setTimeout(() => {
                window.scrollTo(0, 0);
                Router.refresh();
            }, 150);

            setTimeout(() => {
                setAlert(false)
            },2000)

            const data = await newProfileData.json();
            console.log(data)

          
            Router.refresh()
            setShow(false)
        
        }catch(err){
            console.log(err)
        }
    }

    return (
    <>
    {alert && (<div className="alert alert-success DesignAlert" role="alert">
        <p>Bilgiler Başarıyla Değiştirildi!</p>
    </div>)}

  
    

<Button className="SignOutButtonAndDesignButton" onClick={() => setShow(true)}>Profili Düzenle</Button>



<Modal show={show} onHide={() => setShow(false)}>
    <Modal.Header closeButton style={{backgroundColor : '#343a40'}}>
        <Modal.Title style={{color:'white'}}>Profili Düzenle</Modal.Title>
    </Modal.Header>
    
    <Modal.Body className="modalBody">
        {/* inputlar */}
        <input className="modalInput" onChange={(e) => {setNewFullName(e.target.value)}} placeholder="Tam İsim" type="text" />
        <input className="modalInput" onChange={(e) => {setNewBio(e.target.value)}} placeholder="Biyografi" type="text" />

    </Modal.Body>
    <Modal.Footer style={{backgroundColor : '#343a40'}}>
        <Button onClick={() => setShow(false)}>Kapat</Button>
        <Button onClick={newProfileİnfo}>Kaydet</Button>
    </Modal.Footer  >
</Modal>
</>
    );
}

