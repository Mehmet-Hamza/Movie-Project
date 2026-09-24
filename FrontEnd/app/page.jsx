import axios from "axios"
import  Movie  from "@/components/movieCard.jsx"


async function Home(){

   
  // Öne Çıkan Fİlmler
  const res = await axios.get(`http://localhost:4000/api/movies/featured`);
  console.log(res.data.data)

  

  // Popüler Filmler 

  const popRes = await axios.get(`http://localhost:4000/api/movies/trending?limit=12&page=1`);
  let popData = popRes.data;

  
  // En YÜksek Puanlı Filmler
  const puanRes = await axios.get(`http://localhost:4000/api/movies/top-rated?limit=12&page=1&minVotes=0`);
  const puanData = puanRes.data


  // En Yeni Filmler
  const newRes = await axios.get(`http://localhost:4000/api/movies/latest?limit=12&page=1`);
  let newData = newRes.data

  // Türler 
  const categoryRes = await axios.get(`http://localhost:4000/api/genres?sort=name`);
  let typeData = categoryRes.data


  // İstatistikler
  const stateRes = await axios.get(`http://localhost:4000/api/stats/overview`);
  console.log(stateRes.data) 

  return(
    <div className="homePage">

      <Movie popApi = {popData} newApi = {newData} scorApi = {puanData} typeApi = {typeData}/>

        
      
    </div>
  )  
}
export default Home
