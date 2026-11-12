    

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
                    <h2 className="Title">headers Movie</h2>
                </div>
            </LoadingLink>

            <div className="categoryCard">

                <LoadingLink styleclassName="FilmListLink" href="/movie"><p className="Category">Film Listesi</p></LoadingLink>
                
                

                {token && user && (
                <>
                    <LoadingLink className="FilmListLink" href="/watchList"><p className="Category">İzleme Listem</p></LoadingLink>
                    <LoadingLink className="FilmListLink" href="/profile"><p className="Category">Profil</p></LoadingLink>
                </>
                )}
                

                {token && user ? (
                    <p className="FilmListLink">{user}</p>
                ) : (
                    <LoadingLink className="FilmListLink" href="/login">
                        <p className="Category">Giriş Yap</p>
                    </LoadingLink>
                )}
            </div>
        </div>
    );
}

export default Header;
