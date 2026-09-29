 
"use client"

import styles from "./movies.css"
import { Search } from 'lucide-react';
import  Image  from "next/image";
import Link from "next/link"

import { useEffect, useState } from "react";


export default function Movies({allData}){

    const [movieData , setMovieData] = useState(allData)
    const [searchValue , setSearchValue] = useState("");

    // Search value
    const search = (e) => {
        const value = e.target.value;
        setSearchValue(value)
    }
    console.log(searchValue)
    
// 300 ms Debounce
useEffect(() => {

    if (!searchValue.trim()){

        return setMovieData(allData)
    }

    const time = setTimeout(() => {
        const fetchData = async () => {
            const res = await  fetch(`http://localhost:4000/api/movies?search=${searchValue}`);
            const data = await res.json();
            setMovieData(data.data)
            
          //  const res = await fetch(`http://localhost:4000/api/movies?genre=${genres}`)
          
        }
        fetchData()
    }, 300)

    return () => clearTimeout(time)
        

}, [searchValue])
   
    // Button Click
   const searchButton = async () => {

     if (!searchValue.trim()){

        return setMovieData(allData)
    }
        
    const res = await  fetch(`http://localhost:4000/api/movies?search=${searchValue}`);
        const data = await res.json();
        setMovieData(data.data)

   }
   
   const uniqType = [...new Set(movieData.flatMap(movie => movie.genreDetails[0].nameTr))]
    return(
    <div className="filmList">

        <div className="filmBar">
            <h3>Film Listesi</h3>
            
            <div className="searchBar">
               
                <div className="input-group mb-3">
                <input onChange={search} type="text" className="form-control searchInput" placeholder="Film Ara" aria-label="Recipient’s username" aria-describedby="button-addon2" />
                <button onClick={searchButton} className="btn btn-outline-secondary" type="button" id="button-addon2"><Search/></button>
            </div>
                
            </div>
        </div>

        <div className="movies">
            <div className="filterMenü">
                <h3>Film Tür Filtreleme</h3>
                
                <div className="filterType">
                            <ul>
                                {uniqType?.map((item, index) => {
                                    
                                    return(
                                    <div key={index} className="typeMovie">
                                        <input type="checkbox"/>
                                        <li className="typeFilterMovie">{item}</li>
                                    </div>
                                    )
                                })}

                            </ul>
                </div>
            </div>

            <div className="moviesList">

                {movieData.length === 0 ? <h2>Film Bulunamadı</h2> : 
                movieData?.map((item , index) => {
                   
                   return(
                   <Link className="link" href = "#" key = {index}><div className="poster">
                    <Image  src={item.posterUrl} alt="poster" width={350} height={175}/>
                    {/*Image Location */}
                    
                   
                        <div className="movieİnfo">
                            <h4 className="MovieTitle">{item.title}</h4>
                            <p className="MovieYear">{item.year}</p>
                            <p className="MoviePuan">{item.rating}</p>
                            <p className="MovieType">{item.genres[0]}</p>

                        </div>    
                    </div></Link>
                   ) 
                })}

                                          
                    
                
            </div>

        </div>
        


    </div>
    )
}
