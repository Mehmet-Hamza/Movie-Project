    

import { cookies } from "next/headers";
import "./homePage.css";
import LoadingLink from "./LoadingLink.jsx"

async function Header() {
    const cookieStore = await cookies();

    const token = cookieStore.get("token")?.value;
    const user = cookieStore.get("name")?.value;

    return (
    
        <div className="navbar">
            <LoadingLink style={{ textDecoration: "none" }} href="/">
                <div className="HeaderCard">
                    <h2>headers Movie</h2>
                </div>
            </LoadingLink>

            <div style={{display: "flex",gap: "100px",marginRight: "40px"}}>

                <LoadingLink styleclassName="FilmListLink" href="/movie"><p style={{color : 'white', fontWeight : '600'}}>Film Listesi</p></LoadingLink>
                
                

                {token && user && (
                <>
                    <LoadingLink className="FilmListLink" href="/watchList"><p style={{color : 'white', fontWeight : '600'}}>İzleme Listem</p></LoadingLink>
                    <LoadingLink className="FilmListLink" href="/profile"><p style={{color : 'white', fontWeight : '600'}}>Profil</p></LoadingLink>
                </>
                )}
                

                {token && user ? (
                    <p className="FilmListLink">{user}</p>
                ) : (
                    <LoadingLink className="FilmListLink" href="/login">
                        <p style={{color : 'white', fontWeight : '600'}}>Giriş Yap</p>
                    </LoadingLink>
                )}
            </div>
        </div>
    );
}

export default Header;
