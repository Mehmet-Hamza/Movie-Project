"use client"

import { useEffect, useState } from "react";
import Image from "next/image";


function Movie({popApi , newApi, scorApi, typeApi}){
    
    // const [movieType , setMovieType] = useState(typeApi)
    const [scorMovie , scorSetMovie] = useState(scorApi)
    const [newMovie , newSetMovie] = useState(newApi)
    const [popMovie , setPopMovie] = useState(popApi)
    const [movie , setMovie] = useState([]);
    const [index , setİndex] = useState(0);
    const [filtered , setFilter] = useState([])
    const [showAll, setShowAll] = useState(false)

    

useEffect(() => {

    let filterData = typeApi.data.filter(element => {
        return element.nameTr.includes("Aksiyon") || element.nameTr.includes("Komedi") || element.nameTr.includes("Korku") || element.nameTr.includes("Romantik");
    });

    setFilter(filterData)
    
    console.log(filtered)
    const fetchData = async () => {
        const res = await fetch(`http://localhost:4000/api/movies/featured`);
        const data  = await res.json();

        setMovie(data.data);
    
        // typeFilter = movieType.data.filter(item => item.nameTr.toLowerCase() === "komedi")
    }
    fetchData()
    console.log(filtered)

}, [])

useEffect(() => {

    if(movie.length ===0) return;

    const timer = setInterval(() => {
        setİndex(prev => (prev + 1) % movie.length)
    }, 3000)

    
    return () =>clearInterval(timer);
}, [movie])
    
    const  typeButton = () =>{
       setShowAll(true)
    }
    return(
    <>
    <div className="films">
        <div className="header text card">
          <h2>Öne Çıkan Filmler</h2>
        </div>

          <div>
            {movie[index]?.posterUrl && (
              <Image src={movie[index].posterUrl} alt="headerPhoto" width={250} height={250}/>

              )}
              <div className="dialog-Text">
                  <p>{movie[index]?.title}</p>
                  
              </div>
          </div>

          <div className="popularFilms">
                    <div className="films-Text">
                        <h3>Popüler Fİlmler</h3>
                    </div>
                          <div  className="filmCard">
                              <ul style={{ display : 'flex' , flexDirection : 'row' , gap : '50px', listStyle : 'none' }}>
                                
                                {popMovie.data.map((item, index) => {
                                    return(
                                        <li key={index}><Image src = {item.posterUrl} width = {70} height = {70} alt= "popularPhoto"/></li>
                                    )
                                })}
                              </ul>
                          </div>
              </div>

              <div className="NewFilms">
                    <div className="films-Text">
                        <h3>Yeni Çıkanlars</h3>
                    </div>

                        <div className="filmCard">
                          <ul style={{ display : 'flex' , flexDirection : 'row' , gap : '50px', listStyle : 'none' }}>
                            {newMovie.data.map((item , index) => {
                                return(
                                    <li key = {index}><Image alt = "newMovie" src = {item.posterUrl} width = {70} height = {70}/></li>
                                )
                            })}
                          </ul>
                        </div>
              </div>

              <div className="En Yüks">
                    <div className="films-text">
                          <h3>En Yüksek Puanlı</h3>
                    </div>

                        <div className="filmCard">
                          <ul style={{ display : 'flex' , flexDirection : 'row' , gap : '50px', listStyle : 'none' }}>
                            {scorMovie.data.map((item , index) => {
                                return(
                                <li key = {index }><Image alt = "scorMovie" src = {item.posterUrl} width = {70} height = {70}/></li>
                                )
                            })}
                          </ul>
                        </div>
              </div>
    </div>

    <div>
              <div style = {{display : 'flex' , justifyContent : "center"}}>
                <h2>Film Türleri</h2>
              </div>

            
              <div style={{display : 'grid' , gridTemplateColumns : '80px 80px', justifyContent : 'center'}}>
                {filtered.map((item , index) => {
                    return(
                        <div key = {index}><Image  alt = "typePhoto" src={item.coverUrl} width = {70} height = {70}/></div>
                    
                        
                    )
                })}
                {showAll && (

                    typeApi.data.map((element , index) => {
                    return(
                        <div key = {index}><Image  alt = "typePhoto" src={element.coverUrl} width = {70} height = {70}/></div>
                    )
                }
            )


                )}
                
                <button onClick ={typeButton} >Daha Fazlasını Keşfet</button>
              </div>
              
        </div>
    </>
    )
}
export default Movie