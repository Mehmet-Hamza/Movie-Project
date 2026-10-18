import axios from "axios"
import Image from "next/image"
import styles from "./movieDetail.css"
import ScoreGraphic from "./scoreGraph"
import Link from "next/link"
import { cookies } from "next/headers"



export default async function movieDetail({params}) {
   
    const {id} = await params;

    const store = await cookies()
    const token = store.get("token")?.value ?? null
    const user = store.get("name")?.value ?? null

    


    const res = await axios.get(`http://localhost:4000/api/movies/${id}/`);
    const film = await res.data.data;

    const date = new Date(film.runtime);

    const ScorGraph = await axios.get(`http://localhost:4000/api/movies/${id}/ratings`);
        console.log(ScorGraph.data.data)

    
    
    const resMov = await axios.get(`http://localhost:4000/api/movies/${id}`, {
    headers: {
        'Authorization': `Bearer ${token}`
    }
});

const filmData = resMov.data.data;
console.log(filmData)
    
const resMove = await axios.get(`http://localhost:4000/api/movies/${id}`, {
    headers: {
        'Authorization': `Bearer ${token}`
    }
});

const filmsData = resMove.data.data;
    
    const SimilarMovies = await axios.get(`http://localhost:4000/api/movies/${id}/similar`);
    let simMovies = SimilarMovies.data.data


    // Comments
    const commentData = await fetch(`http://localhost:4000/api/movies/${id}/comments?sort=newest&page=1&limit=12`,{
        headers : {'Content-Type' : 'application/json',"Authorization" :  `Bearer ${token}`}
    })
    const dataComment = await commentData.json();
    console.log(dataComment)

    const isLiked = dataComment.data[0].isLikedByMe;
    console.log(isLiked)

    // All
    const allComment = await fetch(`http://localhost:4000/api/comments?sort=newest&page=1&limit=12`);
    const data = await allComment.json()
    console.log(data)

    



    

    return(
        <div className="movieDetail">
            <div className="cardDetail">
                <div className="posterDetails">
                    <Image className="posterImgDetail"  src={film.posterUrl} alt="poster" width={350} height={350} />
                    <div className="movieProperty">
                <ul className="textList">
                        {/* Yıl */}    <li>Yıl : {film.year}</li>
                        {/* Yönetmen */}  <li>Yönetmen : {film.director}</li>
                        {/* Süre */}    <li>Film Süresi : {date.getHours()} Saat</li>
                        {/* Türler */}  <li>Tür : {film.genreDetails.map((genre) =>  genre.nameTr).join(" , ")}</li>
                </ul>
                

            </div>
            

                </div>
                
                <div className="detailText">
                    {/* Başlık */}    <h1>{film.title}</h1>    
                    {/* Özet */}    <p>{film.overview}</p>


                    <div className="scoreGraph">
                        <div className="scoreHeader">
                            <h2>Puan Dağılımı</h2>
                        </div>
                        <div className="scoreBody">
                            <div className="AverageScore">
                                <h3>Ortalama Puan : {ScorGraph.data.data.average}</h3>
                            </div>

                            <ScoreGraphic distribution = {ScorGraph.data.data.distribution} id={id} token = {token} liked = {filmData.isLiked} populated = {filmsData.isFavorite} watchList={filmData.isInWatchlist} myRating = {filmData.myRating} dataComment = {dataComment.data} user = {user}/>
                            </div>
                        </div>
                 
                    </div>

              
                </div>

                  <div className="SimilarMovies">

                    <div className="similarMoviesTitle">
                        <h2>Benzer Filmler</h2>
                    </div>

                <div className="similarMoviesList">
                    {simMovies.map((item, index) => {
                        return(
                        <Link style={{textDecoration : 'none'}} key={index} href={`/movie/${item.id}`}><div className="movieCardSimilar" >

                                <Image style={{borderTopLeftRadius : '18px', borderTopRightRadius : '18px'}} src={item.posterUrl} width={350} height={220} alt="similarMovies"/>

                                <div className="similarMoviesText">
                                    <ul className="similarMoviesUL">
                                        <li><h3>{item.title}</h3></li>
                                        <li>{item.year}</li>
                                        <li>{item.rating}</li>
                                        <li>{item?.genreDetails.map(genre => {
                                            return(
                                            genre.nameTr
                                            )
                                        }).join(" , ")}</li>
                                        
                                    </ul>
                                </div>
                        </div></Link>
                            
                        )
                    })}
                        
                </div>

                


            </div>

               
            
                
                
            </div>
            
        
    )
}