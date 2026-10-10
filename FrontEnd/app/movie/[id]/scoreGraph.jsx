"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { Heart, Star  } from 'lucide-react';
import Image from 'next/image';

export default function ScoreGraphic({distribution, id, similarMovies}) {

    

    const likeButton = async () => {

        const fetchLike = await fetch(`http://localhost:4000/api/movies/${id}/like`,{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                
                
            },
            body: JSON.stringify({
                
                isLiked: true

            })
        })
        const result = await fetchLike.json();
        console.log(result);
    }

    // Fetch request to add the movie to the watchlist
    const WatchListAdd = async () => {
        const fetchWatchListAdd = await fetch(`http://localhost:4000/api/movies/${id}/watchlist`,{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                
                
            },
            body: JSON.stringify({
                
                isInWatchlist: true

            })
        })
        const result = await fetchWatchListAdd.json();
        console.log(result);
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
                    <button className="likeButtonAndPopular buttons like" onClick={likeButton}><Heart /></button>
                    <button className="likeButtonAndPopular buttons popular"><Star /></button>
                </div>
               

                <div className="watchListAdd">
                    <button className="watchListButton" onClick={WatchListAdd}>İzleme Listeme Ekle</button>
                </div>
            </div>


        
           

            </>

            )
    
}