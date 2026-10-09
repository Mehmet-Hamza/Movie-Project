import axios from "axios"
import Image from "next/image"
import styles from "./movieDetail.css"

export default async function movieDetail({params}) {
    
    const {id} = await params;
    
    const res = await axios.get(`http://localhost:4000/api/movies/${id}/`);
    const film = await res.data.data;

    const date = new Date(film.runtime);

    const ScorGraph = await axios.get(`http://localhost:4000/api/movies/${id}/ratings`);
    console.log(ScorGraph.data.data)    

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
                        
                </div>
            
                
            </div>
            
        </div>
    )
}