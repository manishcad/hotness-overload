"use client";

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Camera, Video, Users, UserPlus, Settings, Loader2, X, Heart, MessageCircle, Share2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import { ImageKitProvider, IKUpload } from 'imagekitio-next';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ProfilePage() {
    const { data: session, update } = useSession();
    const router = useRouter();
    const [uploading, setUploading] = useState(false);
    const [videos, setVideos] = useState<any[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<any | null>(null);

    React.useEffect(() => {
        const fetchVideos = async () => {
            if (session?.user) {
                try {
                    const res = await fetch('/api/user/videos');
                    if (res.ok) {
                        const data = await res.json();
                        setVideos(data.videos);
                    }
                } catch (error) {
                    console.error("Failed to fetch videos", error);
                }
            }
        };
        fetchVideos();
    }, [session]);

    const onError = (err: any) => {
        console.log("Error", err);
        setUploading(false);
        toast.error("Upload failed");
    };

    const onSuccess = async (res: any) => {
        console.log("Success", res);

        try {
            const response = await fetch('/api/user/update-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ imageUrl: res.url }),
            });

            if (response.ok) {
                await update({
                    ...session,
                    user: {
                        ...session?.user,
                        image: res.url
                    }
                });
                toast.success("Profile updated successfully");
                router.refresh();
            } else {
                toast.error("Failed to update profile");
            }
        } catch (error) {
            console.error("Failed to update profile", error);
            toast.error("Something went wrong");
        } finally {
            setUploading(false);
        }
    };

    const onVideoSuccess = async (res: any) => {
        console.log("Video Upload Success", res);

        try {
            // Construct a simple thumbnail URL if not provided (ImageKit specific)
            // For ImageKit, we append /ik-thumbnail.jpg to the video URL to get a thumbnail
            const thumbnailUrl = res.thumbnailUrl || `${res.url}/ik-thumbnail.jpg?tr=w-400,h-400`;

            const response = await fetch('/api/videos/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    videoUrl: res.url,
                    thumbnailUrl: thumbnailUrl
                }),
            });

            if (response.ok) {
                toast.success("Video uploaded successfully");
                router.refresh();
            } else {
                toast.error("Failed to save video info");
            }
        } catch (error) {
            console.error("Failed to save video", error);
            toast.error("Something went wrong saving the video");
        } finally {
            setUploading(false);
        }
    };

    const onUploadStart = () => {
        setUploading(true);
    };

    const [commentText, setCommentText] = useState('');

    const handleLike = async () => {
        if (!selectedVideo) return;

        try {
            const res = await fetch('/api/videos/like', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoId: selectedVideo._id }),
            });

            if (res.ok) {
                const data = await res.json();
                setSelectedVideo((prev: any) => ({
                    ...prev,
                    likes: data.likes
                }));
                // Also update the video in the main list
                setVideos((prev) => prev.map(v => v._id === selectedVideo._id ? { ...v, likes: data.likes } : v));
            }
        } catch (error) {
            console.error("Error liking video", error);
        }
    };

    const handleComment = async () => {
        if (!selectedVideo || !commentText.trim()) return;

        try {
            const res = await fetch('/api/videos/comment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoId: selectedVideo._id, text: commentText }),
            });

            if (res.ok) {
                const data = await res.json();
                // The API returns the new comment with populated user info (constructed manually in API)
                // We need to append this to the comments array.
                // Note: The API response structure I defined earlier returns `comment` and `commentsCount`.
                // But wait, the API I wrote returns `comment` which has `user` object, but my frontend expects `userId` object for population.
                // Let's adjust the frontend to handle the response correctly.

                const newComment = {
                    ...data.comment,
                    userId: data.comment.user // Map user to userId to match the populated structure
                };

                setSelectedVideo((prev: any) => ({
                    ...prev,
                    comments: [...(prev.comments || []), newComment]
                }));
                setCommentText('');

                // Update main list count if needed (optional since main list doesn't show comment count usually)
                setVideos((prev) => prev.map(v => v._id === selectedVideo._id ? {
                    ...v,
                    comments: [...(v.comments || []), newComment]
                } : v));
            }
        } catch (error) {
            console.error("Error commenting", error);
        }
    };

    return (
        <ImageKitProvider
            publicKey={process.env.NEXT_PUBLIC_PUBLIC_KEY}
            urlEndpoint={process.env.NEXT_PUBLIC_URL_ENDPOINT}
            authenticator={async () => {
                const response = await fetch('/api/imagekit/auth');
                return await response.json();
            }}
        >
            <ToastContainer theme="dark" />
            <div className="min-h-screen bg-black text-white">
                <Navbar />

                <main className="max-w-4xl mx-auto px-4 py-8">
                    {/* Profile Header */}
                    <div className="flex flex-col items-center space-y-6">

                        {/* Profile Picture Section */}
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 p-1">
                                <div className="w-full h-full rounded-full overflow-hidden bg-gray-900 relative">
                                    {session?.user?.image ? (
                                        <Image
                                            src={session.user.image}
                                            alt="Profile"
                                            width={128}
                                            height={128}
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-800 text-4xl font-bold text-gray-400">
                                            {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Upload Photo Icon */}
                            <label className="absolute bottom-0 right-0 bg-gray-800 p-2 rounded-full border border-gray-700 hover:bg-gray-700 transition-colors shadow-lg group-hover:scale-110 cursor-pointer">
                                {uploading ? (
                                    <Loader2 className="w-5 h-5 text-pink-500 animate-spin" />
                                ) : (
                                    <Camera className="w-5 h-5 text-pink-500" />
                                )}
                                <IKUpload
                                    className="hidden"
                                    onError={onError}
                                    onSuccess={onSuccess}
                                    onUploadStart={onUploadStart}
                                    fileName="profile-avatar.jpg"
                                />
                            </label>
                        </div>

                        {/* User Info */}
                        <div className="text-center space-y-2">
                            <h1 className="text-2xl font-bold text-white">{session?.user?.name || 'User Name'}</h1>
                            <p className="text-gray-400">@{session?.user?.email?.split('@')[0] || 'username'}</p>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center space-x-8 bg-gray-900/50 px-8 py-4 rounded-2xl border border-gray-800 backdrop-blur-sm">
                            <div className="text-center">
                                <div className="text-xl font-bold text-white">500</div>
                                <div className="text-sm text-gray-400">Following</div>
                            </div>
                            <div className="w-px h-8 bg-gray-800"></div>
                            <div className="text-center">
                                <div className="text-xl font-bold text-white">5000</div>
                                <div className="text-sm text-gray-400">Followers</div>
                            </div>
                            <div className="w-px h-8 bg-gray-800"></div>
                            <div className="text-center">
                                <div className="text-xl font-bold text-white">1M</div>
                                <div className="text-sm text-gray-400">Likes</div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-4">
                            <label className="flex items-center space-x-2 bg-pink-600 hover:bg-pink-700 text-white px-6 py-2.5 rounded-full font-medium transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-pink-600/20 cursor-pointer">
                                {uploading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Video className="w-5 h-5" />
                                )}
                                <span>Upload Video</span>
                                <IKUpload
                                    className="hidden"
                                    onError={onError}
                                    onSuccess={onVideoSuccess}
                                    onUploadStart={onUploadStart}
                                    fileName="user-video.mp4"
                                    tags={["video"]}
                                    accept="video/*"
                                />
                            </label>
                            <button className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-2.5 rounded-full font-medium transition-all border border-gray-700">
                                <Settings className="w-5 h-5" />
                                <span>Edit Profile</span>
                            </button>
                        </div>

                    </div>

                    {/* Content Tabs (Optional placeholder for future) */}
                    <div className="mt-12 border-t border-gray-800">
                        <div className="flex justify-center space-x-8 pt-4">
                            <button className="text-pink-500 border-b-2 border-pink-500 pb-2 font-medium">Videos</button>
                            <button className="text-gray-400 hover:text-white pb-2 font-medium transition-colors">Liked</button>
                        </div>

                        <div className="mt-8 grid grid-cols-3 gap-4">
                            {videos.length > 0 ? (
                                videos.map((video) => (
                                    <div
                                        key={video._id}
                                        onClick={() => setSelectedVideo(video)}
                                        className="aspect-[9/16] bg-gray-900 rounded-xl border border-gray-800 overflow-hidden relative group cursor-pointer"
                                    >
                                        <video
                                            src={video.videoUrl}
                                            className="w-full h-full object-cover"
                                            poster={video.thumbnailUrl && !video.thumbnailUrl.includes('.mp4?tr=') ? video.thumbnailUrl : `${video.videoUrl}/ik-thumbnail.jpg?tr=w-400,h-400`}
                                            muted
                                            loop
                                            onMouseOver={e => e.currentTarget.play()}
                                            onMouseOut={e => e.currentTarget.pause()}
                                        />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all" />
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-3 aspect-[9/16] bg-gray-900 rounded-xl border border-gray-800 flex items-center justify-center text-gray-500">
                                    No videos yet
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Video Player Modal */}
                    {selectedVideo && (
                        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                            <div className="max-w-6xl w-full h-full md:h-auto flex flex-col md:flex-row gap-4">
                                {/* Video Player */}
                                <div className="flex-1 relative rounded-2xl overflow-hidden bg-gray-900 flex items-center justify-center">
                                    <button
                                        onClick={() => setSelectedVideo(null)}
                                        className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>

                                    <div className="aspect-[9/16] md:aspect-video w-full bg-black flex items-center justify-center">
                                        <video
                                            src={selectedVideo.videoUrl}
                                            className="w-full h-full object-contain"
                                            controls
                                            autoPlay
                                            poster={selectedVideo.thumbnailUrl && !selectedVideo.thumbnailUrl.includes('.mp4?tr=') ? selectedVideo.thumbnailUrl : `${selectedVideo.videoUrl}/ik-thumbnail.jpg?tr=w-400,h-400`}
                                        />
                                    </div>
                                </div>

                                {/* Video Info & Comments (Simplified for Profile) */}
                                <div className="w-full md:w-96 bg-gray-900 rounded-2xl flex flex-col max-h-[50vh] md:max-h-[600px]">
                                    <div className="p-6 border-b border-gray-800">
                                        <div className="flex items-center space-x-3 mb-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 overflow-hidden">
                                                {session?.user?.image && (
                                                    <Image src={session.user.image} alt="Profile" width={48} height={48} className="object-cover w-full h-full" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-white">{session?.user?.name}</h3>
                                                <p className="text-sm text-gray-400">@{session?.user?.email?.split('@')[0]}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-6 text-white">
                                            <button
                                                onClick={handleLike}
                                                className={`flex items-center space-x-2 transition-colors ${selectedVideo.likes?.includes((session?.user as any)?.id) ? 'text-pink-500' : 'hover:text-pink-500'}`}
                                            >
                                                <Heart className={`w-6 h-6 ${selectedVideo.likes?.includes((session?.user as any)?.id) ? 'fill-pink-500' : ''}`} />
                                                <span className="font-semibold">{selectedVideo.likes?.length || 0}</span>
                                            </button>
                                            <button className="flex items-center space-x-2 hover:text-pink-500 transition-colors">
                                                <MessageCircle className="w-6 h-6" />
                                                <span className="font-semibold">{selectedVideo.comments?.length || 0}</span>
                                            </button>
                                            <button className="flex items-center space-x-2 hover:text-pink-500 transition-colors">
                                                <Share2 className="w-6 h-6" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                        {selectedVideo.comments?.map((comment: any, index: number) => (
                                            <div key={index} className="flex space-x-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 overflow-hidden flex-shrink-0">
                                                    {comment.userId?.image ? (
                                                        <Image src={comment.userId.image} alt="User" width={32} height={32} className="object-cover w-full h-full" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gray-700 text-xs font-bold">
                                                            {comment.userId?.name?.[0] || 'U'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm text-white">{comment.userId?.name || 'User'}</p>
                                                    <p className="text-sm text-gray-300">{comment.text}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {(!selectedVideo.comments || selectedVideo.comments.length === 0) && (
                                            <div className="text-center text-gray-500 mt-10">No comments yet</div>
                                        )}
                                    </div>

                                    {/* Comment Input */}
                                    <div className="p-4 border-t border-gray-800">
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="text"
                                                value={commentText}
                                                onChange={(e) => setCommentText(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                                                placeholder="Add a comment..."
                                                className="flex-1 bg-gray-800 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 text-white"
                                            />
                                            <button
                                                onClick={handleComment}
                                                className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors"
                                            >
                                                <MessageCircle className="w-5 h-5 text-white" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </main>
            </div>
        </ImageKitProvider>
    );
}
