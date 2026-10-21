"use client"
import { useState } from "react"
 import { Modal, Button } from 'react-bootstrap';
 import { useRouter } from "next/navigation"





export default function ProfileDesing({userName, token}) {

    const Router = useRouter()
   
    const [show, setShow] = useState(false);
    const [newFullName, setNewFullName] = useState("");
    const [newBio, setNewBio] = useState("");
    const [datas , setDatas] = useState([]);

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

