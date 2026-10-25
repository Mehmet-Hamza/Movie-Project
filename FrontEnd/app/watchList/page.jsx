import { cookies } from "next/headers";
import Image  from "next/image";
import styles from "./watchList.css"
export default async function watchList(){

    // fetch Watch Movies 

    const store = await cookies()
    const token = store.get("token").value


    const getMovies = await fetch(`http://localhost:4000/api/me/watchlist?page=1&limit=12`,{
        method : "GET",
        headers : {"Content-Type" : "application/json", "Authorization" : ` Bearer ${token}`}
        
    })

    const data = await getMovies.json()
    console.log(data)
    return(
        <div className="watchList">
            <div className="header">
                <h2>İzleme Listem</h2>
            </div>

            <div className="body" style={{width : "100%", minHeight : '100vh', padding : '25px', display : "grid", gridTemplateColumns : "1fr 1fr 1fr 1fr"}}>
                {data.data.map((item, index) => {
                    return(
                    <div key = {index} className="cards">
                        <Image  src={item.posterUrl} width={100} height={100} alt="watchListPhoto" style={{ width: "100%", height: "180px", borderTopLeftRadius :'20px', borderTopRightRadius : '20px'}}/>

                        <div className="movieİnfo">
                            <h4 className="MovieTitle">{item.title}</h4>
                            <p className="MovieYear">{item.year}</p>
                            <p className="MoviePuan">{item.rating}</p>
                            <p className="MovieType">{item?.genreDetails.map(g => g.nameTr).join(" , ")}</p>
                        </div>
                    </div>
                    )
                })}
            </div>
        </div>
    )
}