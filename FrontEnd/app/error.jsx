
"use client"
import { useRouter } from "next/navigation"
import styles from "./error.css"
import { startTransition } from "react"

export default function Error({ reset }) {
    const router = useRouter()

    const retry = () => {
        startTransition(() => {
            router.refresh()  
            reset()            
        })
    }

    return (
        <div style={{width : '100%', height : '100vh' , backgroundColor : '#282828', color : 'white', display : 'flex', flexDirection : 'column', justifyContent : 'center', alignItems : 'center', fontSize : '20px'}} className="errorPage">
            <h2>Bir şeyler ters gitti</h2>
            <p>Sayfa yüklenemedi. Lütfen tekrar dene.</p>
            <button className="ErrorBtn" style={{border : 'none', backgroundColor : 'F9F9F9' , padding : '15px', borderRadius : '15px'}} onClick={retry}>Tekrar Dene</button>
        </div>
    )
}