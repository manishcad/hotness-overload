import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Video from '@/models/Video';
import User from '@/models/User';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { videoId, text } = await req.json();

        if (!videoId || !text) {
            return NextResponse.json({ error: 'Video ID and text are required' }, { status: 400 });
        }

        await dbConnect();

        const userId = (session.user as any).id;

        const video = await Video.findById(videoId);

        if (!video) {
            return NextResponse.json({ error: 'Video not found' }, { status: 404 });
        }

        const newComment = {
            userId,
            text,
            createdAt: new Date(),
        };

        video.comments.push(newComment);
        await video.save();

        // Populate the new comment with user details to return to frontend
        // We can't easily populate a single subdocument in mongoose after save without re-fetching or manual lookup
        // Let's just return the comment with the current user's session info since we know who just commented

        const returnedComment = {
            ...newComment,
            _id: video.comments[video.comments.length - 1]._id,
            user: {
                _id: userId,
                name: session.user.name,
                image: session.user.image
            }
        };

        return NextResponse.json({
            message: 'Comment added',
            comment: returnedComment,
            commentsCount: video.comments.length
        });

    } catch (error) {
        console.error('Error adding comment:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
