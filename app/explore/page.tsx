"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Image from 'next/image';
import Link from 'next/link';
import { UserPlus, Users, Loader2 } from 'lucide-react';

interface User {
    _id: string;
    name: string;
    email: string;
    image: string;
    followers: string[];
    createdAt: string;
}

export default function ExplorePage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch('/api/explore/users');
                if (res.ok) {
                    const data = await res.json();
                    setUsers(data.users);
                }
            } catch (error) {
                console.error("Failed to fetch users", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                            Explore New Creators
                        </h1>
                        <div className="text-sm text-gray-400">
                            Discover the hottest new talent
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {users.map((user) => (
                                <div
                                    key={user._id}
                                    className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-pink-500/50 transition-all duration-300 group relative overflow-hidden"
                                >
                                    {/* Background Gradient Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="relative flex flex-col items-center text-center space-y-4">
                                        {/* Avatar */}
                                        <div className="relative">
                                            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-pink-500 to-purple-600">
                                                <div className="w-full h-full rounded-full overflow-hidden bg-gray-800">
                                                    <Image
                                                        src={user.image}
                                                        alt={user.name}
                                                        width={96}
                                                        height={96}
                                                        className="object-cover w-full h-full"
                                                    />
                                                </div>
                                            </div>
                                            {/* New Badge (if recently created - logic can be refined) */}
                                            <div className="absolute -bottom-2 -right-2 bg-pink-500 text-white text-[10px] font-bold px-2 py-1 rounded-full border-2 border-gray-900">
                                                NEW
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-lg text-white group-hover:text-pink-400 transition-colors">
                                                {user.name}
                                            </h3>
                                            <p className="text-sm text-gray-400">
                                                @{user.email.split('@')[0]}
                                            </p>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                                            <div className="flex items-center space-x-1">
                                                <Users className="w-4 h-4" />
                                                <span>{user.followers?.length || 0}</span>
                                            </div>
                                            <span>•</span>
                                            <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                                        </div>

                                        {/* Action Button */}
                                        <Link
                                            href={`/profile/${user._id}`}
                                            className="w-full"
                                        >
                                            <button className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center space-x-2 group-hover:bg-gradient-to-r group-hover:from-pink-600 group-hover:to-purple-600">
                                                <UserPlus className="w-4 h-4" />
                                                <span>View Profile</span>
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && users.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            No new users found. Be the first to invite your friends!
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
