"use client"

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./homePage.css"
import Link from 'next/link'




function Movie({featData,popApi , newApi, scorApi, typeApi , backMov}){
    

    const [scorMovie , scorSetMovie] = useState(scorApi)
    const [newMovie , newSetMovie] = useState(newApi)
    const [popMovie , setPopMovie] = useState(popApi)
    const [movie , setMovie] = useState(featData);
    const [index , setİndex] = useState(0);
    const [filtered , setFilter] = useState([])
    const [showAll, setShowAll] = useState(false)

    

useEffect(() => {

    let filterData = typeApi.data.filter(element => {
        return element.nameTr.includes("Aksiyon") || element.nameTr.includes("Komedi") || element.nameTr.includes("Korku") || element.nameTr.includes("Romantik");
    });

    setFilter(filterData)
    
    

}, [])


    

    const  typeButton = () =>{
       setShowAll(prev => !prev )
    }
    return(
    <>
   
    <div className="homePage">
        <div className="featured">

             <video 
        key = {index}
        src={backMov[index].videoUrl} 
        autoPlay 
        muted 
         
        playsInline 
        onEnded={() => setİndex(prev => (prev + 1) % (movie.length || 1 ))}
        className="kapsayici-video"
/>


            <div className="header-text-card">
          <h2 style={{position : 'relative' , zIndex : '10'}}>Öne Çıkan Filmler</h2>
        </div>

          <div>
            {movie[index]?.posterUrl && (
              <Link key={index} href={`/movie/${movie[index].id}`}><Image quality={95} className="sliderImg" src={featData[index].posterUrl} alt="headerPhoto" width={400} height={400}/></Link>

              )}
              <div className="dialog-Text">
                  <p>{`${movie[index]?.title} - ${movie[index]?.year}`}</p>
                  
              </div>
          </div>

        </div>
        <div className="films">
          <div className="popularFilms">
                    <div className="films-text">
                        <h3>Popüler Fİlmler</h3>
                    </div>
                          <div  className="filmCard">
                              <ul style={{ display : 'flex' , flexDirection : 'row' , gap : '50px', listStyle : 'none' }}>
                                
                                {popMovie.data.map((item, index) => {
                                    return(
                                        <Link  key={index} href={`/movie/${item.id}`}><li ><Image className="filmsImage" src = {item.posterUrl} width = {70} height = {70} alt= "popularPhoto"/></li></Link> 
                                    )
                                })}
                              </ul>
                          </div>
              </div>

              <div className="NewFilms">
                    <div className="films-text">
                        <h3>Yeni Çıkanlar</h3>
                    </div>

                        <div className="filmCard">
                          <ul style={{ display : 'flex' , flexDirection : 'row' , gap : '50px', listStyle : 'none' }}>
                            {newMovie.data.map((item , index) => {
                                return(
                                    <Link key = {index} href={`/movie/${item.id}`}><li><Image className="filmsImage" alt = "newMovie" src = {item.posterUrl} width = {70} height = {70}/></li></Link>
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
                                <Link  key = {index } href={`/movie/${item.id}`}><li><Image className="filmsImage" alt = "scorMovie" src = {item.posterUrl} width = {70} height = {70}/></li> </Link>
                                )
                            })}
                          </ul>
                        </div>
              </div>
        </div>
    
    <div className="filmTypes">
              <div className="filmTypeText">
                <h2>Film Türleri</h2>
              </div>

            
              <div className="typeCard" >
                {filtered.map((item , index) => {
                    return(

                    <div key = {index} style={{ position : 'relative'}}>
                        <h3 className="typeText" style={{fontSize : '15px', position : 'absolute', top : '50px' , left : '50px', color : 'white', }}>{`${item.nameTr} ${item.emoji}`}</h3>
                        
                        <Link href = {`/movie?genre=${item.nameTr}`}><div className="img1"><Image  alt = "typePhoto" src={item.coverUrl} width = {150} height = {150}/></div></Link>
                    
                    </div>
                        
                    )
                })}
                {showAll && (

                    typeApi.data.map((element , index) => {
                    return(
                        <div key = {index} style={{ position : 'relative'}}>
                             <h3  className="typeText" style={{fontSize : '15px', position : 'absolute', top : '50px' , left : '50px', color : 'white'}}>{element.nameTr}</h3>
                            <Link href={`/movie?genre=${element.nameTr}`} ><div  className="img1" ><Image  alt = "typePhoto" src={element.coverUrl} width = {150} height = {150}/></div></Link>
                        </div>
                    )
                }
            )


                )}
                
                
              <button className="buttonMore"  onClick ={typeButton} >{showAll === true ? "Daha az Göster" : "Daha Fazla Göster"}</button>  
             
              </div>
              
        </div>
    
    </div>

    
    </>
    )
}
export default Movie