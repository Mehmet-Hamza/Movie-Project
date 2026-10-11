import { signOut } from "./action";

export default function Profile() {
    return (
        
        <form action={signOut}>
            <div className="signOut">
                
                <button type="submit">Çıkış Yap</button>
            </div>
        </form>
    );
}