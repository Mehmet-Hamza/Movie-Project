import Link from "next/link"
import styles from "./homePage.css"

function Header(){
    return(
        <div className="navbar">
            <div>
                    <h2>headers Movie</h2>
            </div>
            
            <div style={{display : 'flex',gap : "100px"}}>
                <Link href={"/profile"}>Profile</Link>
                <Link href={"/login"}>Login</Link>
            </div>
                
        </div>
    )
}
export default Header