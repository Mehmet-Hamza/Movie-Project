import Link from "next/link"
import styles from "./homePage.css"

function Header(){
    return(
        <div className="navbar">
            <Link style={{textDecoration : 'none'}} href={"/"}><div className="HeaderCard">
                    <h2>headers Movie</h2>
            </div></Link>
            
            <div style={{display : 'flex',gap : "100px", marginRight : "40px"}}>
                <Link className="FilmListLink" href={"/movie"}>Film Listesi</Link>
                <Link className="FilmListLink" href={"/profile"}>Profile</Link>
                <Link className="FilmListLink" href={"/login"}>Login</Link>
            </div>
                
        </div>
    )
}
export default Header