
"use client"

import styles from "./movies.css"
import { Search } from 'lucide-react';
import  Image  from "next/image";
import Link from "next/link"
import { useEffect, useState } from "react";
import {useRouter , useSearchParams} from "next/navigation"


export default function Movies({allData}){

    const router = useRouter();
    const searchParams = useSearchParams();


    const [maxRating, setMaxRating] = useState("")
    const [minRating , setMinRating] = useState("");
    const [minYear , setMinYear] = useState("")
    const [maxYear , setMaxYear] = useState("")
    const [sortValue, setSortValue] = useState(searchParams.get("sort") || "");
    const [selectedGen , setSelectedGen] = useState(() => {
        const genreParam = searchParams.get("genre");
        return genreParam ? genreParam.split(",") : [];
    })
    
    const [movieData , setMovieData] = useState(allData)
    const [searchValue , setSearchValue] = useState(searchParams.get("search") || "");
    const [forFİlterData , setForFilterData] = useState(allData)
    const [currentPage , setCurrentPage] = useState(1)

    
    // Search value
    const search = (e) => {
        
        setSearchValue(e.target.value)
    }

    

    

// 300 ms Debounce
useEffect(() => {
    const timer = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());

        if (searchValue.trim()) {
            params.set("search", searchValue);
           
        } else {
            params.delete("search");
             
            
        }

        router.push(`?${params.toString()}`, { scroll: false });

        const fetchData = async () => {
            
            if (!searchValue.trim()) {
                
                return;
            }
            
            try {
                const res = await fetch(`http://localhost:4000/api/movies?search=${searchValue}`);
                const data = await res.json();
                setMovieData(data.data ?? []);
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
        setCurrentPage(currentPage);
    }, 300);

    return () => clearTimeout(timer);
}, [searchValue]);
   
    // Button Click
   const searchButton = async () => {

     if (!searchValue.trim()){
        setSelectedGen([]);
        
        return setMovieData(allData)
    }
        
    const res = await  fetch(`http://localhost:4000/api/movies?search=${searchValue}`);
        const data = await res.json();
        setMovieData(data.data)

   }
   
   const uniqType = [...new Set(allData.flatMap(movie => movie?.genreDetails?.map(genre => genre.nameTr) || []))]

   console.log(allData)
   
   // Type Filter
   const changeGen = (e) => {
        const genreName = e.target.value;
        const checked = e.target.checked;

        const nextSelected = checked
            ? [...selectedGen, genreName]
            : selectedGen.filter(item => item !== genreName);

  setSelectedGen(nextSelected);

  const params = new URLSearchParams(searchParams.toString());

  if (nextSelected.length > 0) {
    params.set("genre", nextSelected.join(","));
  } else {
    params.delete("genre");
  }

  router.push(`?${params.toString()}`, { scroll: false });
};


   useEffect(() => {
    
    if (searchValue.trim()) return;


    if(selectedGen.length === 0){
        setMovieData(allData);
        return;
    }

    const filteredMovies = allData.filter(genre =>
        genre.genreDetails?.some(genreData =>
            selectedGen.includes(genreData.nameTr)
        )
    );
    console.log("Filtrelenmiş Film Sayısı:", filteredMovies);

    setMovieData(filteredMovies);
    setCurrentPage(currentPage)
}, [selectedGen, allData, searchValue]);


   // Sort  
   const place = async (e) => {

    const value = e.target.value
        setSortValue(value)

        const sortParams = new URLSearchParams(searchParams.toString())
        
         if(!value){
            sortParams.delete("sort")
            router.push(`?${sortParams.toString()}`, {scroll : false})
            setMovieData(allData)
            return;
        }

        sortParams.set("sort", value)
        router.push(`?${sortParams.toString()}`, {scroll : false})
        

        
        const res = await fetch(`http://localhost:4000/api/movies?sort=${value}&limit=85`)
        const data = await res.json()
        
        
            setMovieData(data.data)
        
        
   }

   // Year Sort
   const sortYear = () => {
    
        if(!minYear && !maxYear){
            return setMovieData(allData)
        }

        // Filter Year
        let filterYears = allData.filter(item => {
            return(
        (item.year >= Number(minYear))  && (item.year <= Number(maxYear))
            ) 
        })
        setMovieData(filterYears)

   }

   // Rating Sort
   const sortRating = () => {

    if(!minRating && !maxRating){
            return setMovieData(allData)
        }
            // Filter Rating
            let filterRating = allData.filter((item) => {
            return(
                (item.rating >= Number(minRating)) && (item.rating <= Number(maxRating))
            )
        })

        setMovieData(filterRating)
   }

   // UseEffect Year and Rating
   useEffect(() => {

    sortYear();
   },[minYear, maxYear])

   useEffect(() => {
    sortRating()

   },[minRating, maxRating])



    return(
    <div className="filmList">

        <div className="filmBar">
            <h3>Film Listesi</h3>
            
            <div className="searchBar">
                <div className="input-group mb-3">
                <input value={searchValue} onChange={search} type="text" className="form-control searchInput" placeholder="Film Ara" aria-label="Recipient’s username" aria-describedby="button-addon2" />
                <button onClick={searchButton} className="btn btn-outline-secondary" type="button" id="button-addon2"><Search/></button>
            </div>
                
            </div>
        </div>

        <div className="movies">
            <div className="filterMenü">
                <h3 style={{fontSize : '20px', marginTop : '20px', paddingInline : '10px'}}>Filtreleme Ölçütü</h3>
                
                <div className="filterType">
                            <ul>
                                {uniqType?.map((item, index) => {
                                   
                                    return(
                                    <div key={index} className="typeMovie">
                                        <input  value={item}  onChange = {changeGen} checked={selectedGen.includes(item)} type="checkbox"/>
                                        <li className="typeFilterMovie">{item}</li>
                                    </div>
                                    )
                                })}

                            </ul>
                </div>

                    <select value={sortValue}  onChange={place} className="form-select sortChange" aria-label="Default select example">
                        <option value="-popularity">Sırala</option>
                        <option value="-rating">Azalan Puan</option>
                        <option value="+rating">Artan Puan</option>
                        <option value="-year">Azalan Yıl</option>
                        <option value="+year">Artan Yıl</option>
                        <option value="-popularity"> Azalan Popülerlik</option>
                        <option value="+popularity"> Artan Popülerlik</option>
                        <option value="title">Alfabetik</option>
                    </select>


                <div className="yearAndRatingSort">
                    <div className="yearSort">
                        <div className="yearHeader">
                            <h4>Yıl</h4>
                        </div>
                            <div className="sortYearİnside">

                                <div className="SortMin">
                                    <label htmlFor="min">En Az</label>
                                    <input placeholder = "1972" onChange={(e) => {let minData = e.target.value ;setMinYear(minData)}} className="sortInput" type="number" />

                                </div>
                                
                                <div className="SortMax">
                                    <label htmlFor="max">En Fazla</label>
                                    <input  placeholder="2026" onChange={(e) => {let maxData = e.target.value ; setMaxYear(maxData)} } className="sortInput" type="number" />

                                </div>
                                
                            </div>
                                
                    </div>

                    <div className="ratingSort">
                        <div className="ratingHeader">
                                <h4>Puan</h4>
                        </div>
                            
                            <div className="sortYearİnside">
                                <div className="SortMin">
                                    <label htmlFor="min">En Az</label>
                                    <input placeholder="0" onChange={(e) => {let minDataRating = e.target.value ;setMinRating(minDataRating)}} className="sortRatingInput" type="number" />

                                </div>

                                <div className="SortMax">
                                    
                                    <label htmlFor="max">En Fazla</label>
                                    <input placeholder="10" onChange={(e) => {let maxDataRating = e.target.value ; maxDataRating <= 10 ? setMaxRating(maxDataRating) : 10} } className="sortRatingInput" type="number" />
                                </div>
                                
                                
                            </div>
                                


                    </div>
                </div>
            </div>

            <div className="moviesList">

                {movieData.length === 0 ? <h2 style={{color : 'white'}}>Film Bulunamadı</h2> : 
                movieData.slice((currentPage - 1) * 10, currentPage * 10).map((item , index) => {
                   
                   return(
                   <Link className="link" href = "#" key = {index}><div className="poster">
                    <Image  src={item.posterUrl} alt="poster" width={350} height={175} style={{ width: "100%", height: "180px", borderTopLeftRadius :'20px', borderTopRightRadius : '20px'}}/>
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
        

            <div className="pagination">
                <ul className="paginationList">
                    <button onClick={() => setCurrentPage(1)} className="paginationItem">1</button>
                    <button onClick={() => setCurrentPage(2)} className="paginationItem">2</button>
                    <button onClick={() => setCurrentPage(3)} className="paginationItem">3</button>
                    <button onClick={() => setCurrentPage(4)} className="paginationItem">4</button>
                    <button onClick={() => setCurrentPage(5)} className="paginationItem">5</button>
                    <button onClick={() => setCurrentPage(6)} className="paginationItem">6</button>
                    <button onClick={() => setCurrentPage(7)} className="paginationItem">7</button>
                    <button onClick={() => setCurrentPage(8)} className="paginationItem">8</button>
                    <button onClick={() => setCurrentPage(9)} className="paginationItem">9</button>
                </ul>
            </div>  
    </div>
    )
}