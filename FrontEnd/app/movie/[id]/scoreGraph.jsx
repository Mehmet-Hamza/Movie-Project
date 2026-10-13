"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { Heart, Star  } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

export default function ScoreGraphic({distribution, id, similarMovies, liked , token, populated , watchList}) {

  const [isLiked , setİsLiked] = useState(liked)
  const [isFavorites, setİsFavorite] = useState(populated)
 const [isWatched, setİsWatched] = useState(watchList)
 const [rating , setRating] = useState([1,2,3,4,5,6,7,8,9,10])
  

    const likeButton = async () => {

        const likeFetch = await fetch(`http://localhost:4000/api/movies/${id}/like/toggle`,{
        method : "POST",
        headers : {'Content-Type' : 'application/json' , 'Authorization' : `Bearer ${token}`},
        body : JSON.stringify({
            isLiked : true
        })
    });

    const data = await likeFetch.json()
    

    if(data.data.isLiked){
        setİsLiked(true)
    }
    else {
        setİsLiked(false)
    }
    
        
}

const popularButton = async () => {
    const PopFetch = await fetch(`http://localhost:4000/api/movies/${id}/favorite/toggle`,{
        method : "POST",
        headers : {'Content-Type' : 'application/json' , 'Authorization' : `Bearer ${token}`},
        body : JSON.stringify({
            isFavorite : true
        })

    })

    const popularData = await PopFetch.json();

    if(popularData.data.isFavorite){
        setİsFavorite(true)
    }
    else {
        setİsFavorite(false)
    }

}
   

    

    // Fetch request to add the movie to the watchlist
    const WatchListAdd = async () => {
        const fetchWatchListAdd = await fetch(`http://localhost:4000/api/movies/${id}/watchlist/toggle`,{
            method: "POST",
            headers: {
                "Content-Type": "application/json", "Authorization" : `Bearer ${token}`
                
                
            },
            body: JSON.stringify({
                
                isInWatchlist: true

            })
        })
        const result = await fetchWatchListAdd.json();
        console.log(result);

        if(result.data.isInWatchlist){
            setİsWatched(true)
        }
        else{
            setİsWatched(false)
         }
    }

        const ratings = async() => {
            const ratingData = await fetch(`http://localhost:4000/api/movies/${id}/rate` , {
                method : "POST",
                headers : {'Content-Type' : 'application/json' , 'Authorization' : `Bearer ${token}`},
                body : JSON.stringify({
                    score : rating[1]
                })

            })
            const ratData = await ratingData.json();
            console.log(ratData)
        }




            return(
            <>
                <div className="distributionGraph">
                    <BarChart width={500} height={300} data={distribution}>
                        <Bar dataKey="count" fill="#8884d8" name="Oy Sayısı" />
                            <XAxis dataKey="score" />
                            <YAxis />
                        <Tooltip />
                    </BarChart>
                </div>
            
            <div className="likeAndPopuler">

                <div className="likeButton">
                 
                 
                    <button className="likeButtonAndPopular buttons like" onClick={likeButton}><Heart fill={isLiked ? 'red' : 'none'} color={isLiked ? "red" : "currentColor"}/></button>
                  
                    <button className="likeButtonAndPopular buttons popular" onClick={popularButton}><Star fill={isFavorites ? 'purple' : 'none'} color={isFavorites ? 'purple' : 'currentColor'}/></button>
                </div>
               

                <div className="watchListAdd">
                    <button className="watchListButton" onClick={WatchListAdd}>{isWatched ? "İzleme Listesinden Çıkar" : "İzleme Listesine Ekle"}</button>
                </div>
            </div>

                <div>
                    <div className='RatingHeader'>
                        <h2>Filme 10 Üzerinden Puan Ver</h2>
                    </div>

                    <div className='ratingStar'>
                        {rating.map((item, index) => {
                            return(
                           
                               

                                <button onClick={ratings} key={index}><Star/></button>
                            
                            )
                        
                        })}
                    </div>
                </div>
        
           

            </>

            )
    
}