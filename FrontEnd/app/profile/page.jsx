import { signOut } from "./action";
import { cookies } from "next/headers";
import Image from "next/image"
import styles from "./profile.css"
import { redirect } from "next/navigation";
import  ProfileDesing  from "./profileDesign.jsx"
import Link from 'next/link'


export default async function Profile({gettingData}) {

    const store = await cookies()

    let username = store.get("name").value
    let token = store.get("token")?.value
    console.log("TOKEN:", token);

    console.log(gettingData);


    // User Statics 
    const getStatic = await fetch(`http://localhost:4000/api/users/${username}`)
    const data = await getStatic.json();
    console.log(data)

    const userInfo = data.data;
    console.log(userInfo.avatar)

    const date = new Date().toISOString()


    // Recommend
    const getReco = await fetch(`http://localhost:4000/api/me/recommendations?page=1&limit=12`,{
        headers : {
            'Authorization' : `Bearer ${token}`
        }
    });
    const dataReco = await getReco.json();
    console.log(dataReco)
    const recommentData = dataReco.data




   
    
    return (
    <>
                           
        <form action={signOut}>
            <div className="signOut">
                <div className="formCard">
                <div className="leftSide">

                    <div className="userAvatar">
                        <img className="avatarImage" src={userInfo.avatar} width={150} height={150} alt="avatar"/>
                        <div className="userInfoText">
                            <h1>{userInfo.username}</h1>
                            <h3 style={{color :  "#6c757d"}}>{userInfo.fullName}</h3>
                        </div>
                        
                    </div>

                    <div className="bio">
                        <p><strong>Biyografi </strong>: {userInfo.bio}</p>
                    </div>

                   
                    <div className="states">
                            <div className="favouriteMovies box">
                                <p><strong>Favorilenmiş Film Sayısı</strong></p>
                                <p className="boxText">{userInfo.stats.favoriteCount}</p>
                            </div>

                            <div className="likedMovies box">
                                <p><strong>Beğenilen Film Sayısı</strong></p>
                                <p className="boxText">{userInfo.stats.likeCount}</p>
                            </div>

                            <div className="rating box">
                                <p><strong>Puanladıklarım</strong></p>
                                <p className="boxText">{userInfo.stats.ratingCount}</p>
                            </div>

                            <div className="box">
                                <p><strong>İzleme Listemdeki Filmler Sayısı</strong></p>
                                <p className="boxText">{userInfo.stats.watchlistCount}</p>
                            </div>

                            <div className="comment box">
                                <p><strong>Yorumlar</strong></p>
                                <p className="boxText">{userInfo.stats.commentCount}</p>
                            </div>
                    </div>

                    <div className="accountCreateDate">

                             <div className="lastLoginAt date">
                                <p><strong>Son Girilen Zaman</strong> : {new Date(userInfo.lastLoginAt).toTimeString().split("GMT")[0].trim()}</p> <strong>|</strong> <p>{new Date(userInfo.lastLoginAt).toLocaleDateString('tr')}</p>
                        
                            </div>

                            <div className="createAtLogin date">

                                <p><strong>Hesap Oluşturma Tarihi</strong> : {new Date(userInfo.createdAt).toTimeString().split("GMT")[0].trim()}</p> <strong>|</strong> <p>{new Date(userInfo.createdAt).toLocaleDateString('tr')}</p>
                            </div>

                           
                    </div>
                
                </div>
                       

            <div className="rightSide">
                
                <div className="recomment">
                    <div className="recoHeader">
                        <h2>Senin İçin Öneriler</h2>
                    </div>
                    
                    <div className="movieCard">
                        {recommentData.map((item, index) =>{
                            return(
                                <Link style={{textDecoration : 'none'}} key={index} href={`/movie/${item.id}`}><div key={index} className="movieCard">

                                    <div className="posterCards">
                                        <Image alt="moviePhoto" className="posterImg"  src={item.posterUrl} width={150} height={200}/>
                                    </div>
                                    
                                    <div className="movieInfo">

                                    <p>{item.title}</p>
                                    <p>{item.year}</p>
                                    <p>{item.rating}</p>
                                    <p>{item.genreDetails.map(element => {
                                        return(
                                            element.nameTr
                                        )
                                    }).join(" , ")}</p>


                                    </div>
                                   
                                
                                </div></Link>
                            )
                        })}
                    </div>
                     
                </div>
                
                <div className="signoutCard">
                        
                        <ProfileDesing userName = {username} token = {token}/>
                        <button className="SignOutButtonAndDesignButton" type="submit">Çıkış Yap</button>
                    </div> 

                   
            </div>
                    
                </div>
                
                </div>
                            
        </form>
                           
    </>
    );
}