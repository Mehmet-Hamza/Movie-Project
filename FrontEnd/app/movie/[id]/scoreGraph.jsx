"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { Heart, Star, Pencil , Trash } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import Swal from 'sweetalert2'

export default function ScoreGraphic({distribution, id, similarMovies, liked , token, populated , watchList, myRating , dataComment, user}) {

  const [isLiked , setİsLiked] = useState(liked)
  const [isLikedComment , setİsLikedComment] = useState(() => {

    const inital = {};
    dataComment.forEach(comment => {
        inital[comment.id] = comment.isLikedByMe
    });
    return inital;

  }) 
    const [isFavorites, setİsFavorite] = useState(populated)
    const [isWatched, setİsWatched] = useState(watchList)
    const [rating , setRating] = useState(myRating)
    const [hover, setHover] = useState(0);
    const [writeComment , setCommentWrite] = useState("")
    const [currentMes,setCurrentMes] = useState(dataComment)
   
  
  

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

        const ratings = async(selectScore) => {

            
        
            const ratingData = await fetch(`http://localhost:4000/api/movies/${id}/rate` , {
                method : "POST",
                headers : {'Content-Type' : 'application/json' , 'Authorization' : `Bearer ${token}`},
                body : JSON.stringify({
                    score : selectScore
                    
                })

            })
            const ratData = await ratingData.json();
            console.log(ratData)

            if(!ratingData){
                console.log("puan kaydedilmedi")
                return;
            }
            
            setRating(selectScore)

         
        }

        
        const commentLikeButton = async (commentId) => {
        
            const comLike = await fetch(`http://localhost:4000/api/comments/${commentId}/like`,{
                method : "POST",
                headers : {'Content-Type' : 'application/json' , 'Authorization' : `Bearer ${token}`},
                body : JSON.stringify({
                    isLikedByMe : true
                })
            })

            console.log(dataComment[0])
            console.log(commentId)
            
            const dataCom = await comLike.json()
            console.log(dataCom)

      
            setİsLikedComment(prev => ({...prev, [commentId] : dataCom.data.isLikedByMe}))
        }



       
        const writeMessage = async () => {
            const write = await fetch(`http://localhost:4000/api/movies/${id}/comments`,{
                    method : "POST",
                    headers : {'Content-Type' : 'application/json' , 'Authorization' : `Bearer ${token}`},
                    body : JSON.stringify({
                    content : writeComment
                   
                })

            })

            const writeData = await write.json()
            console.log([writeData])

            
            setCurrentMes(prev => [...prev , writeData.data])
            
            
 
        }   


        const commentDelete = async(commentId) => {
            const deleteFetch = await fetch(`http://localhost:4000/api/comments/${commentId}`,{
                method : "DELETE",
                headers : {'Content-Type' : 'application/json' , 'Authorization' : `Bearer ${token}`}
            })

            
            setCurrentMes(dataComment)
        }

        const patch = async (content, patchID) => {
            
            const { value: newText } = await Swal.fire({
                text : "Yorum Düzenleme",
                input : "text",
                inputValue : content,
                showCancelButton: true,
                confirmButtonText: 'Kaydet',
                cancelButtonText: 'İptal'
            });

            if(newText){
                await fetch(`http://localhost:4000/api/comments/${patchID}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content: newText })
             });
            }

            // Önemli not state ile ekrana al veriyi 
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
                        {[1,2,3,4,5,6,7,8,9,10].map((item, index) => {
                            return(
                           
                               <button 
                                    key={item} 
                                    type="button"
                                    style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}
                                    
                                    onClick={() => ratings(item)}
                                    onMouseEnter={() => setHover(item)} 
                                    onMouseLeave={() => setHover(0)}
                                >
                                    <Star 
                                        fill={item <= (hover || rating) ? "gold" : "none"} 
                                        color={item <= (hover || rating) ? "gold" : "currentColor"}  
                                    />
                                </button>
                                
                            
                            )
                        
                        })}
                    </div>

                    <div className="comments">
                    <div className="commentHeader">
                        <h2>Yorumlar</h2>
                    </div>

                    <div className="commentCard">
                        
                        <div className='Card'>
                            {currentMes.map((item, index) => {
                                return(
                                    <div key={index} className='users' style={{backgroundColor : 'lightgray'}}>
                                        <div className='user'>
                                            <h3>{item?.user.fullName}</h3>
                                        </div>

                                        <div className='commentContext'>
                                            <p>{item?.content}</p>
                                        </div>

                                        <div className='commentDate'>
                                            
                                            <p>{new Date(item.createdAt).toLocaleDateString('tr')} - {new Date(item.createdAt).toTimeString().split("GMT")[0].trim()}</p>
                                        </div>

                                        <div className='commentLike'>
                                                <button onClick={() => {commentLikeButton(item.id)}}><Heart fill={isLikedComment[item.id] ? "red" : "none"} color={isLikedComment[item.id] ? 'red' : 'currentColor'} /></button>
                                        </div>
                                      

                                        {user === item.user.username && (<div className='MyComment'>
                                            <button onClick={() => {patch(item.content, item.id)}}> <Pencil /></button>
                                            <button onClick={() => {commentDelete(item.id)}}> <Trash /></button>
                                        </div>)}

                                        
                                    </div>
                                    
                                )
                            })}
                            <div className='commentWriteCard' style={{backgroundColor : 'lightGray', display : 'flex', justifyContent : 'center'}}>
                                <input onChange={(e) => {setCommentWrite(e.target.value)}} type="text" placeholder='Bir Yorum Yaz !' style={{ minWidth : '50%'}}/>
                                <button onClick={writeMessage}>Gönder</button>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
        
           

            </>

            )
    
}