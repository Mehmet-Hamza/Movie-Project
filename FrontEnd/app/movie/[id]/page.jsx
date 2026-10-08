import axios from "axios"

export default async function movieDetail({params}) {
    
    const {id} = await params;
    
    const res = await axios.get(`http://localhost:4000/api/movies/${id}/`);
    const film = await res.data.data;

    return(
        <div>
            <h2>
                {film.title}
            </h2>
        </div>
    )
}