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
  const genre = params.genre || "";
  


const allGenresRes = await axios.get(`http://localhost:4000/api/genres`);
const uniqType = allGenresRes.data.data

// Tüm Filmler
  const allRes = await axios.get(`http://localhost:4000/api/movies?genre=${genre}&genreMatch=any&sort=${sort}&search=${search}&yearMin=${sortMin}&yearMax=${sortMax}&minRating=${RatingMin}&maxRating=${RatingMax}&page=${page}&limit=85`);
  let movieAll = allRes.data.data;

  //const uniqType = [...new Map(movieAll.flatMap(movie => movie?.genreDetails?.map(genre => [genre.slug , genre.nameTr]) || [])).entries()].map(([slug,nameTr]) => ({slug , nameTr}))
  


  
  return(
    <Movies allData = {movieAll} genreList = {uniqType}/>
  )

}