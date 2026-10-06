import axios from "axios"
import Movies from "./movieList.jsx"


export default async  function MoviePage({searchParams}){

  const params = await searchParams;

  const sort = params.sort || "-popularity";
  const search = params.search || "";
  const genre = params.genre || "";

 
// Tüm Filmler
  const allRes = await axios.get(`http://localhost:4000/api/movies?genreMatch=any&sort=${sort}&genre=${genre}&search=${search}&page=1&limit=85`);
  let movieAll = allRes.data.data;
  

 console.log("SSR GENRE:", genre);
console.log("SSR FILM SAYISI:", allRes.data.data?.length);

  return(
    <Movies allData = {movieAll}/>
  )

}