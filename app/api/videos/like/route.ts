import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Video from '@/models/Video';
import User from '@/models/User'; // Import User to ensure model is registered

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { videoId } = await req.json();

        if (!videoId) {
            return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
        }

        await dbConnect();

        // Get user ID from session (we added it to session in auth.ts)
        const userId = (session.user as any).id;

        const video = await Video.findById(videoId);

        if (!video) {
            return NextResponse.json({ error: 'Video not found' }, { status: 404 });
        }

        // Check if user already liked the video
        const isLiked = video.likes.includes(userId);

        if (isLiked) {
            // Unlike
            video.likes = video.likes.filter((id: any) => id.toString() !== userId);
        } else {
            // Like
            video.likes.push(userId);
        }

        await video.save();

        return NextResponse.json({
            message: isLiked ? 'Unliked' : 'Liked',
            likes: video.likes,
            isLiked: !isLiked
        });

    } catch (error) {
        console.error('Error liking video:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
