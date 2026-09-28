"use client"


import styles from "./movies.css"
import { Search } from 'lucide-react';
import  Image  from "next/image";
import { useState } from "react";


export default function Movies({allData}){

    
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

                {movieData.map((item , index) => {
                   
                   return(
                   <div key = {index} style={{width : '200px', height : '250px', backgroundColor : 'blue'}}>
                       
                    {/*Image Location */}
                    
                   
                        <div className="movieİnfo">
                            <h4 className="MovieTitle"></h4>
                            <p className="MovieYear"></p>
                            <p className="MoviePuan"></p>
                            <p className="MovieType"></p>

                        </div>    
                    </div>
                   ) 
                })}

                                          
                    
                
            </div>

        </div>
        


    </div>
    )
}