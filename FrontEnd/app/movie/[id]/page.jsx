import axios from "axios"
import Image from "next/image"

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
                <div className="poster">
                    <Image  src={film.posterUrl} alt="poster" width={350} height={350} />

                </div>

                <div className="detailText">
                        <ul>
                        {/* Başlık */}    <li><h1>{film.title}</h1></li>
                        {/* Yıl */}    <li>{film.year}</li>
                        {/* Yönetmen */}    <li>{film.director}</li>
                        {/* Süre */}    <li>{date.getHours()} Saat</li>
                        {/* Türler */}  <li>{film.genreDetails.map((genre) => <span key={genre}>{genre.nameTr}</span>).reduce((prev, curr) => [prev, ", ", curr])}</li>
                        {/* Özet */}    <li>{film.overview}</li>
                        </ul>
                </div>
            </div>
        </div>
    )
}