
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


    const [maxRating, setMaxRating] = useState(searchParams.get("sortRatingMax") || "")
    const [minRating , setMinRating] = useState(searchParams.get("sortRatingMin") || "");
    const [minYear , setMinYear] = useState(searchParams.get("sortMin") || "")
    const [maxYear , setMaxYear] = useState(searchParams.get("sortMax") || "")
    const [sortValue, setSortValue] = useState(searchParams.get("sort") || "");
    const [selectedGen , setSelectedGen] = useState(() => {
        const genreParam = searchParams.get("genre");
        return genreParam ? genreParam.split(",") : [];
    })
    
    const [movieData , setMovieData] = useState(allData)
    
    const [searchValue , setSearchValue] = useState(searchParams.get("search") || "");

    const [currentPage , setCurrentPage] = useState(searchParams.get("page") || 1)

    
    useEffect(() => {
        searchParams.get("page") || 1;
    },[])
    
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
        return
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

    const sortYearParams = new URLSearchParams(searchParams.toString())

    
        if(!minYear && !maxYear){
            sortYearParams.delete("sortMin")
            sortYearParams.delete("sortMax")
            router.push(`?${sortYearParams.toString()}`,{scroll:false})
            return setMovieData(allData)
            
        }

        // Filter Year
        let filterYears = allData.filter(item => {
            return(
        (item.year >= Number(minYear))  && (item.year <= Number(maxYear))
            ) 
        })
        setMovieData(filterYears)
        sortYearParams.set("sortMin", minYear)
        sortYearParams.set("sortMax", maxYear)
        router.push(`?${sortYearParams.toString()}` ,{scroll : false})

   }
   

   // Rating Sort
   const sortRating = () => {

    const sortRatingParams = new URLSearchParams(searchParams.toString())

    if(!minRating && !maxRating){

            sortRatingParams.delete("sortRatingMin")
            sortRatingParams.delete("sortRatingMax")
            router.push(`?${sortRatingParams.toString()}`, {scroll : false})
            return setMovieData(allData)
        }
            // Filter Rating
            let filterRating = allData.filter((item) => {
            return(
                (item.rating >= Number(minRating)) && (item.rating <= Number(maxRating))
            )
        })

        setMovieData(filterRating)
        sortRatingParams.set("sortRatingMin", minRating)
        sortRatingParams.set("sortRatingMax", maxRating)
        router.push(`?${sortRatingParams.toString()}`, {scroll : false})
   
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
                                    <input value={minYear} placeholder = "1972" onChange={(e) => {
                                    setMinYear(e.target.value)}} className="sortInput" type="number" />

                                </div>
                                
                                <div className="SortMax">
                                    <label htmlFor="max">En Fazla</label>
                                    <input value={maxYear} placeholder="2026" onChange={(e) => {setMaxYear(e.target.value)} } className="sortInput" type="number" />

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
                                    <input value={minRating} placeholder="0" onChange={(e) => {setMinRating(e.target.value)}} className="sortRatingInput" type="number" />

                                </div>

                                <div className="SortMax">
                                    
                                    <label htmlFor="SortMax">En Fazla</label>
                                    <input value={maxRating} placeholder="10" onChange={(e) => {setMaxRating(e.target.value)} } className="sortRatingInput" type="number" />
                                </div>
                                
                                
                            </div>
                                


                    </div>
                </div>
            </div>

            <div className="moviesList">

                {movieData.length === 0 ? <h2 style={{color : 'white'}}>Film Bulunamadı</h2> : 
                movieData.slice((currentPage - 1) * 10, currentPage * 10).map((item , index) => {
                   
                   return(
                   <Link className="link" href = {`/movie/${item.id}`} key = {index}><div className="poster">
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
                    <button onClick={() => {
                        const pageParams = new URLSearchParams(searchParams.toString());
                        pageParams.set("page", 1);
                        router.push(`?${pageParams.toString()}`, { scroll: false });
                        setCurrentPage(1)}} className="paginationItem">1</button>
                    
                    <button onClick={() => {
                        const pageParams = new URLSearchParams(searchParams.toString());
                        pageParams.set("page", 2);
                        router.push(`?${pageParams.toString()}`, { scroll: false });
                        setCurrentPage(2)}} className="paginationItem">2</button>
                    
                    <button onClick={() => {
                        const pageParams = new URLSearchParams(searchParams.toString());
                        pageParams.set("page", 3);
                        router.push(`?${pageParams.toString()}`, { scroll: false });
                        setCurrentPage(3)}} className="paginationItem">3</button>
                    
                    <button onClick={() => {
                        const pageParams = new URLSearchParams(searchParams.toString());
                        pageParams.set("page", 4);
                        router.push(`?${pageParams.toString()}`, { scroll: false });
                        setCurrentPage(4)}} className="paginationItem">4</button>
                   
                    <button onClick={() => {
                        const pageParams = new URLSearchParams(searchParams.toString());
                        pageParams.set("page", 5);
                        router.push(`?${pageParams.toString()}`, { scroll: false });
                        setCurrentPage(5)}} className="paginationItem">5</button>
                    
                    <button onClick={() => {
                        const pageParams = new URLSearchParams(searchParams.toString());
                        pageParams.set("page", 6);
                        router.push(`?${pageParams.toString()}`, { scroll: false });
                        setCurrentPage(6)}} className="paginationItem">6</button>
                    
                    <button onClick={() => {
                        const pageParams = new URLSearchParams(searchParams.toString());
                        pageParams.set("page", 7);
                        router.push(`?${pageParams.toString()}`, { scroll: false });
                        setCurrentPage(7)}} className="paginationItem">7</button>
                    
                    <button onClick={() => {
                        const pageParams = new URLSearchParams(searchParams.toString());
                        pageParams.set("page", 8);
                        router.push(`?${pageParams.toString()}`, { scroll: false });
                        setCurrentPage(8)}} className="paginationItem">8</button>
                    
                    <button onClick={() => {
                        const pageParams = new URLSearchParams(searchParams.toString());
                        pageParams.set("page", 9);
                        router.push(`?${pageParams.toString()}`, { scroll: false });
                        setCurrentPage(9)}} className="paginationItem">9</button>
                </ul>
            </div>  
    </div>
    )
}