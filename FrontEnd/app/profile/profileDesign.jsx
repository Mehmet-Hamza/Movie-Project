"use client"
import { useState } from "react"
 import { Modal, Button } from 'react-bootstrap';




export default function ProfileDesing() {
   
    const [show, setShow] = useState(false);

    return (
    <>
       

<Button onClick={() => setShow(true)}>Profili Düzenle</Button>

<Modal show={show} onHide={() => setShow(false)}>
    <Modal.Header closeButton>
        <Modal.Title>Profili Düzenle</Modal.Title>
    </Modal.Header>
    <Modal.Body>
        {/* inputlar */}
    </Modal.Body>
    <Modal.Footer>
        <Button onClick={() => setShow(false)}>Kapat</Button>
        <Button>Kaydet</Button>
    </Modal.Footer>
</Modal>
</>
    );
}

