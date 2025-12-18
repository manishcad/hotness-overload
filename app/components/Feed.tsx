"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Play, Heart, MessageCircle, Share2, X, Send, Bookmark, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';
interface Video {
    id: number;
    thumbnail: string;
    creator: string;
    views: string;
    likes: number;
    isLive?: boolean;
    badge?: string;
}

interface Comment {
    id: number;
    user: string;
    text: string;
    avatar: string;
}

const VideoFeedHero: React.FC = () => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
    const { data: session, status } = useSession();
    const isAuthenticated = status === 'authenticated';
    const [liked, setLiked] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);
    const [comments, setComments] = useState<Comment[]>([
        { id: 1, user: 'Sarah_M', text: 'Amazing content! 🔥', avatar: 'bg-pink-500' },
        { id: 2, user: 'John_Doe', text: 'Love this!', avatar: 'bg-blue-500' },
        { id: 3, user: 'Emma_W', text: 'So beautiful! ❤️', avatar: 'bg-purple-500' },
    ]);
    const [newComment, setNewComment] = useState('');
    const [page, setPage] = useState(1);
    const observerRef = useRef<HTMLDivElement>(null);

    // Generate mock videos
    const generateVideos = (startId: number): Video[] => {
        const creators = ['Laxmi telugu&English', 'Cassy ✨✨', 'Tazz', 'Durgaa 🎭💜', 'Priya_K', 'Anjali_S'];
        const newVideos: Video[] = [];

        for (let i = 0; i < 8; i++) {
            newVideos.push({
                id: startId + i,
                thumbnail: `https://picsum.photos/400/600?random=${startId + i}`,
                creator: creators[Math.floor(Math.random() * creators.length)],
                views: `${(Math.random() * 10).toFixed(1)}M`,
                likes: Math.floor(Math.random() * 5000),
                isLive: Math.random() > 0.7,
                badge: Math.random() > 0.5 ? 'VS' : undefined,
            });
        }
        return newVideos;
    };

    useEffect(() => {
        setVideos(generateVideos(1));
    }, []);

    // Infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setPage((prev) => prev + 1);
                    setVideos((prev) => [...prev, ...generateVideos(prev.length + 1)]);
                }
            },
            { threshold: 0.5 }
        );

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const handleVideoClick = (video: Video) => {
        setSelectedVideo(video);
        setLiked(false);
        setBookmarked(false);
    };

    const handleLike = () => {
        if (!isAuthenticated) {
            alert('Please sign in to like videos');
            return;
        }
        setLiked(!liked);
    };

    const handleComment = () => {
        if (!isAuthenticated) {
            alert('Please sign in to comment');
            return;
        }
        if (newComment.trim()) {
            setComments([
                ...comments,
                {
                    id: comments.length + 1,
                    user: 'You',
                    text: newComment,
                    avatar: 'bg-gradient-to-br from-pink-500 to-purple-600',
                },
            ]);
            setNewComment('');
        }
    };

    const handleBookmark = () => {
        if (!isAuthenticated) {
            alert('Please sign in to bookmark videos');
            return;
        }
        setBookmarked(!bookmarked);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-6 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                    Recommended for you
                </h2>

                {/* Video Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {videos.map((video, index) => (
                        <div
                            key={video.id}
                            onClick={() => handleVideoClick(video)}
                            className="relative group cursor-pointer rounded-2xl overflow-hidden aspect-[9/16] transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/20"
                        >
                            {/* Video Thumbnail */}
                            <img
                                src={video.thumbnail}
                                alt={video.creator}
                                className="w-full h-full object-cover"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 group-hover:opacity-90 transition-opacity">
                                {/* Top Badges */}
                                <div className="absolute top-3 left-3 flex items-center space-x-2">
                                    <div className="flex items-center space-x-1 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
                                        <Play className="w-3 h-3 fill-white" />
                                        <span className="text-xs font-semibold">{video.views}</span>
                                    </div>
                                    {video.badge && (
                                        <span className="bg-pink-500 px-2 py-1 rounded-full text-xs font-bold">
                                            {video.badge}
                                        </span>
                                    )}
                                    {video.isLive && (
                                        <span className="bg-red-500 px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                                            LIVE
                                        </span>
                                    )}
                                </div>

                                {/* Bottom Info */}
                                <div className="absolute bottom-4 left-4 right-4">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500"></div>
                                        <span className="font-semibold text-sm">{video.creator}</span>
                                    </div>
                                    <div className="flex items-center space-x-3 text-xs text-gray-300">
                                        <div className="flex items-center space-x-1">
                                            <Heart className="w-4 h-4" />
                                            <span>{video.likes}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Play Button Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
                                        <Play className="w-8 h-8 fill-white ml-1" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Loading Indicator */}
                <div ref={observerRef} className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>

            {/* Video Player Modal */}
            {selectedVideo && (
                <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="max-w-6xl w-full h-full md:h-auto flex flex-col md:flex-row gap-4">
                        {/* Video Player */}
                        <div className="flex-1 relative rounded-2xl overflow-hidden bg-gray-900">
                            <button
                                onClick={() => setSelectedVideo(null)}
                                className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="aspect-[9/16] md:aspect-video w-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                                <img
                                    src={selectedVideo.thumbnail}
                                    alt={selectedVideo.creator}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-20 h-20 bg-pink-500 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                                        <Play className="w-10 h-10 fill-white ml-1" />
                                    </div>
                                </div>
                            </div>

                            {/* Video Info */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500"></div>
                                        <div>
                                            <h3 className="font-bold text-lg">{selectedVideo.creator}</h3>
                                            <p className="text-sm text-gray-400">{selectedVideo.views} views</p>
                                        </div>
                                    </div>
                                    <button className="bg-pink-500 px-6 py-2 rounded-full font-semibold hover:bg-pink-600 transition-colors">
                                        Follow
                                    </button>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center space-x-6">
                                    <button
                                        onClick={handleLike}
                                        className={`flex items-center space-x-2 transition-colors ${liked ? 'text-pink-500' : 'text-white hover:text-pink-500'
                                            }`}
                                    >
                                        <Heart className={`w-6 h-6 ${liked ? 'fill-pink-500' : ''}`} />
                                        <span className="font-semibold">{selectedVideo.likes + (liked ? 1 : 0)}</span>
                                    </button>
                                    <button className="flex items-center space-x-2 hover:text-pink-500 transition-colors">
                                        <MessageCircle className="w-6 h-6" />
                                        <span className="font-semibold">{comments.length}</span>
                                    </button>
                                    <button
                                        onClick={handleBookmark}
                                        className={`flex items-center space-x-2 transition-colors ${bookmarked ? 'text-yellow-500' : 'hover:text-yellow-500'
                                            }`}
                                    >
                                        <Bookmark className={`w-6 h-6 ${bookmarked ? 'fill-yellow-500' : ''}`} />
                                    </button>
                                    <button className="flex items-center space-x-2 hover:text-pink-500 transition-colors">
                                        <Share2 className="w-6 h-6" />
                                    </button>
                                    <button className="ml-auto hover:text-pink-500 transition-colors">
                                        <MoreVertical className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Comments Section */}
                        <div className="w-full md:w-96 bg-gray-900 rounded-2xl flex flex-col max-h-[50vh] md:max-h-[600px]">
                            <div className="p-4 border-b border-gray-800">
                                <h3 className="font-bold text-lg">Comments ({comments.length})</h3>
                            </div>

                            {/* Comments List */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="flex space-x-3">
                                        <div className={`w-8 h-8 rounded-full ${comment.avatar} flex-shrink-0`}></div>
                                        <div>
                                            <p className="font-semibold text-sm">{comment.user}</p>
                                            <p className="text-sm text-gray-300">{comment.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Comment Input */}
                            <div className="p-4 border-t border-gray-800">
                                {isAuthenticated ? (
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="text"
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                                            placeholder="Add a comment..."
                                            className="flex-1 bg-gray-800 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                                        />
                                        <button
                                            onClick={handleComment}
                                            className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors"
                                        >
                                            <Send className="w-5 h-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-sm text-gray-400 mb-3">Sign in to comment</p>
                                        <button className="bg-pink-500 px-6 py-2 rounded-full font-semibold hover:bg-pink-600 transition-colors">
                                            Sign In
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoFeedHero;