 
"use client"

import styles from "./movies.css"
import { Search } from 'lucide-react';
import  Image  from "next/image";
import Link from "next/link"

import { useEffect, useState } from "react";


export default function Movies({allData}){

    const [selectedGen , setSelectedGen] = useState([])
    const [movieData , setMovieData] = useState(allData)
    const [searchValue , setSearchValue] = useState("");
    const [forFİlterData , setForFilterData] = useState(allData)

    // Search value
    const search = (e) => {
        const value = e.target.value;
        setSearchValue(value)
    }

    
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
   
   const uniqType = [...new Set(forFİlterData.flatMap(movie => movie?.genreDetails?.map(genre => genre.nameTr || [])))]

   // Type Filter
   const changeGen = (e) => {
        const GenreName = e.target.value
        const isCheck = e.target.checked

        if(isCheck){
            setSelectedGen(prev => [...prev , GenreName])
        }
        else{
            setSelectedGen(prev => prev.filter(item => item !== GenreName))
        }
   }

   useEffect(() => {

        if(selectedGen.length === 0){
            return setMovieData(allData)
        }

        const filteredMovies = allData.filter(genre =>
            genre.genreDetails?.some(genreData =>
                selectedGen.includes(genreData.nameTr)))

        setMovieData(filteredMovies)
   },[selectedGen, allData])
   
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
                <h3 style={{fontSize : '20px', marginTop : '20px', paddingInline : '10px'}}>Film Tür Filtreleme</h3>
                
                <div className="filterType">
                            <ul>
                                {uniqType?.map((item, index) => {
                                   
                                    return(
                                    <div key={index} className="typeMovie">
                                        <input  value={item}  onChange = {changeGen} type="checkbox"/>
                                        <li className="typeFilterMovie">{item}</li>
                                    </div>
                                    )
                                })}

                            </ul>
                </div>
            </div>

            <div className="moviesList">

                {movieData.length === 0 ? <h2 style={{color : 'white'}}>Film Bulunamadı</h2> : 
                movieData?.map((item , index) => {
                   
                   return(
                   <Link className="link" href = "#" key = {index}><div className="poster">
                    <Image  src={item.posterUrl} alt="poster" width={350} height={175} style={{ width: "100%", height: "200px"}}/>
                    {/*Image Location */}
                    
                   
                        <div className="movieİnfo">
                            <h4 className="MovieTitle">{item.title}</h4>
                            <p className="MovieYear">{item.year}</p>
                            <p className="MoviePuan">{item.rating}</p>
                            <p className="MovieType">{item?.genreDetails.map(g => g.nameTr).join(" , ")}</p>

                        </div>    
                    </div></Link>
                   ) 
                })}

                                          
                    
                
            </div>

        </div>
        


    </div>
    )
}
