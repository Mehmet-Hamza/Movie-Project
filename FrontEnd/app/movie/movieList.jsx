import axios from "axios"
import Movies from "./page.jsx"

export default async  function MoviePage(){

// Tüm Filmler
  const allRes = await axios.get(`http://localhost:4000/api/movies?genreMatch=any&sort=-popularity&page=1&limit=85`);
  let movieAll = allRes.data.data

  console.log(movieAll);
  console.log(allRes.data);
  console.log(allRes.data.data)
  console.log(allRes)

  return(
    <Movies allData = {movieAll}/>
  )

}