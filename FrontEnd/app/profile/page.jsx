import { signOut } from "./action";
import { cookies } from "next/headers";
import Image from "next/image"

export default async function Profile() {

    const store = await cookies()

    let username = store.get("name").value


    // User Statics 
    const getStatic = await fetch(`http://localhost:4000/api/users/${username}`)
    const data = await getStatic.json();
    console.log(data)

    const userInfo = data.data;
    console.log(userInfo.avatar)

    const date = new Date().toISOString()

    return (
        
        <form action={signOut}>
            <div className="signOut">
                <div className="userAvatar">
                    <img src={userInfo.avatar} width={150} height={150} alt="avatar"/>
                </div>

                <div className="bio">
                    <p><strong>Biyografi </strong>: {userInfo.bio}</p>
                </div>

                <div className="fullName">
                    <p><strong>Tam Ad</strong> : {userInfo.fullName}</p>
                </div>

                <div className="lastLoginAt">
                    <p><strong>Son Girilen Zaman</strong> : {new Date(userInfo.lastLoginAt).toTimeString()} | </p><p>{new Date(userInfo.lastLoginAt).toLocaleDateString('tr')}</p>
                </div>

                <div className="states">
                        <div className="favouriteMovies">
                            <p><strong>Favorilenmiş Film Sayısı</strong> : {userInfo.stats.favoriteCount}</p>
                        </div>

                        <div className="likedMovies">
                            <p><strong>Beğenilen Film Sayısı</strong> : {userInfo.stats.likeCount}</p>
                        </div>

                        <div className="rating">
                            <p><strong>Puanladıklarım</strong> : {userInfo.stats.ratingCount}</p>
                        </div>

                        <div className="watchList">
                            <p><strong>İzleme Listemdeki Filmler Sayısı</strong> : {userInfo.stats.watchlistCount}</p>
                        </div>

                        <div className="comment">
                            <p><strong>Yorumlar</strong> : {userInfo.stats.commentCount}</p>
                        </div>
                </div>

                <div className="accountCreateDate">

                        <p><strong>Hesap Oluşturma Tarihi</strong>: {new Date(userInfo.createdAt).toTimeString()}</p> <p>{new Date(userInfo.createdAt).toLocaleDateString('tr')}</p>
                </div>
                <h1>{username}</h1>        
                <button type="submit">Çıkış Yap</button>
            </div>
        </form>
    );
}