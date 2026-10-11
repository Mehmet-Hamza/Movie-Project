     
import Link from "next/link";
import { cookies } from "next/headers";
import "./homePage.css";

async function Header() {
    const cookieStore = await cookies();

    const token = cookieStore.get("token")?.value;
    const user = cookieStore.get("name")?.value;

    return (
        <div className="navbar">
            <Link style={{ textDecoration: "none" }} href="/">
                <div className="HeaderCard">
                    <h2>headers Movie</h2>
                </div>
            </Link>

            <div style={{display: "flex",gap: "100px",marginRight: "40px"}}>

                <Link className="FilmListLink" href="/movie">Film Listesi</Link>
                <Link className="FilmListLink" href="#">İzleme Listem</Link>
                <Link className="FilmListLink" href="/profile">Profil</Link>

                {token && user ? (
                    <p className="FilmListLink">{user}</p>
                ) : (
                    <Link className="FilmListLink" href="/login">
                        Giriş Yap
                    </Link>
                )}
            </div>
        </div>
    );
}

export default Header;
