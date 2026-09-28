 
"use client"


import styles from "./movies.css"
import { Search } from 'lucide-react';
import  Image  from "next/image";
import Link from "next/link"
import { useState } from "react";


export default function Movies({allData = []}){

        
    const [movieData , setMovieData] = useState(allData)
    
   
    return(
    <div className="filmList">

        <div className="filmBar">
            <h3>Film Listesi</h3>
            
            <div className="searchBar">
               
                <div className="input-group mb-3">
                <input type="text" className="form-control searchInput" placeholder="Film Ara" aria-label="Recipient’s username" aria-describedby="button-addon2" />
                <button className="btn btn-outline-secondary" type="button" id="button-addon2"><Search/></button>
            </div>
                
            </div>
        </div>

        <div className="movies">
            <div className="filterMenü">
                filtre
            </div>

            <div className="moviesList">

                {movieData?.map((item , index) => {
                   
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
