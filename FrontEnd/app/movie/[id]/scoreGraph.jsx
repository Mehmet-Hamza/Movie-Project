"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { Heart, Star  } from 'lucide-react';

export default function ScoreGraphic({distribution, id}) {

    

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
                    <button className="likeButtonAndPopular" onClick={likeButton}><Heart /></button>
                </div>
                <div className="popularButton">
                    <button className="likeButtonAndPopular"><Star /></button>
                </div>

                <div className="watchListAdd">
                    <button>İzleme Listeme Ekle</button>
                </div>
            </div>

            </>

            )
    
}