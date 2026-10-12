import { signOut } from "./action";

export default async function Profile() {

    // User Statics 
    const getStatic = await fetch(`http://localhost:4000/api/user/`)

    return (
        
        <form action={signOut}>
            <div className="signOut">
                
                <button type="submit">Çıkış Yap</button>
            </div>
        </form>
    );
}