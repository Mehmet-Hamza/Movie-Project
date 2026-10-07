import axios from "axios"
import Movies from "./movieList.jsx"


export default async  function MoviePage({searchParams}){




  const params = await searchParams;

  const sort = params.sort || "-popularity";
  const search = params.search || "";
  const sortMin = params.sortMin || "";
  const sortMax = params.sortMax || "";
  const RatingMin = params.sortRatingMin || "";
  const RatingMax = params.sortRatingMax || "";
  const page = params.page || 1;



  

// Tüm Filmler
  const allRes = await axios.get(`http://localhost:4000/api/movies?genreMatch=any&sort=${sort}&search=${search}&yearMin=${sortMin}&yearMax=${sortMax}&minRating=${RatingMin}&maxRating=${RatingMax}&page=${page}&limit=85`);
  let movieAll = allRes.data.data;
  

console.log(sortMin)

  
  return(
    <Movies allData = {movieAll}/>
  )

}