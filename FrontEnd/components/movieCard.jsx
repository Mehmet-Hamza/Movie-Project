"use client"

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./homePage.css"
import Link from 'next/link'




function Movie({featData,popApi , newApi, scorApi, typeApi , backMov,stateRes}){
    

    const [scorMovie , scorSetMovie] = useState(scorApi)
    const [newMovie , newSetMovie] = useState(newApi)
    const [popMovie , setPopMovie] = useState(popApi)
    const [movie , setMovie] = useState(featData);
    const [index , setİndex] = useState(0);
    const [filtered , setFilter] = useState([])
    const [showAll, setShowAll] = useState(false)
    const [FilterFilmTür , SetFilterFilmTür] = useState([])

    console.log(stateRes)

    

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
                <h1 style={{fontSize : '50px'}}>Film Türleri</h1>
              </div>

              <div className="typeCard" >
                <div className="scrollCard">
                {filtered.map((item , index) => {
                    return(

                    <div key = {index} style={{position : 'relative' , minWidth : '350px', minHeight : '200px', display : 'flex', justifyContent : 'center', alignItems : 'center'}}>
                        <h3 className="typeText" style={{fontSize : '20px', color : 'white', position : 'absolute'}}>{`${item.nameTr}`}</h3>
                        
                        <Link href = {`/movie?genre=${item.slug}&page=1`}><div className="img1"><Image style={{borderRadius :'15px'}} alt = "typePhoto" src={item.coverUrl} width = {350} height = {200}/></div></Link>
                    
                    </div>
                        
                    )
                })}
                
                {showAll && (

                    typeApi.data.map((element , index) => {
                        
                    return(
                        <div key = {index} style={{ position : 'relative' , minWidth : '350px', minHeight : '200px', display : 'flex', justifyContent : 'center', alignItems : 'center'}}>
                             <h3  className="typeText" style={{fontSize : '20px', color : 'white', position : 'absolute'}}>{element.nameTr}</h3>
                            <Link href={`/movie?genre=${element.slug}&page=1`} ><div  className="img1" ><Image  alt = "typePhoto" src={element.coverUrl} width = {350} height = {200}/></div></Link>
                        </div>
                    )
                }
            )


                )}
               
                          
             
              <button className="buttonMore"  onClick ={typeButton} >{showAll === true ? "Daha az Göster" : "Daha Fazla Göster"}</button>  
             
              </div>
              </div>
              
        </div>

        <div className="Statics">
            <div>
                <div className="head">
                    <h3>Toplam Film</h3>
                

                    <h3>{stateRes.data.totals.movies}</h3>
                </div>
            </div>

            <div>

                <div className="head">
                    <h3>Toplam Kullanıcı</h3>
                

                
                    <h3>{stateRes.data.totals.users}</h3>
                </div>

            </div>

            <div>

                  <div className="head">
                    <h3>Toplam Yorum</h3>
                

               
                    <h3>{stateRes.data.totals.comments}</h3>
                </div>


            </div>
        </div>
    
    </div>

    
    </>
    )
}
export default Movie