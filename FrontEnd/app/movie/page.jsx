import axios from "axios"
import Movies from "./movieList.jsx"


export default async  function MoviePage({searchParams}){
<<<<<<< HEAD

  const params = await searchParams;

  const sort = params.sort || "-popularity";
  const search = params.search || "";
  const genre = params.genre || "";
=======

  const params = await searchParams;

  const sort = params.sort || "-popularity";
  const search = params.search || "";
  const genre = params.Genre || "";

// Tüm Filmler
  const allRes = await axios.get(`http://localhost:4000/api/movies?genreMatch=any&sort=${sort}&genre=${genre}&search=${search}&page=1&limit=85`);
  let movieAll = allRes.data.data;
  
>>>>>>> 220963d7913b12160b4fd083a6f74dc3a0bb6381

 
// Tüm Filmler
  const allRes = await axios.get(`http://localhost:4000/api/movies?genreMatch=any&sort=${sort}&genre=${genre}&search=${search}&page=1&limit=85`);
  let movieAll = allRes.data.data;
  

 console.log("SSR GENRE:", genre);
console.log("SSR FILM SAYISI:", allRes.data.data?.length);

  return(
    <Movies allData = {movieAll}/>
  )

}