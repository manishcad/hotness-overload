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

        const { videoUrl, thumbnailUrl } = await req.json();

        if (!videoUrl || !thumbnailUrl) {
            return NextResponse.json({ error: 'Video URL and Thumbnail URL are required' }, { status: 400 });
        }

        await dbConnect();

        // Find user by email to get _id
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const newVideo = await Video.create({
            userId: user._id,
            videoUrl,
            thumbnailUrl,
        });

        // Add video to user's videos array
        await User.findByIdAndUpdate(user._id, {
            $push: { videos: newVideo._id }
        });

        return NextResponse.json({ message: 'Video uploaded successfully', video: newVideo });
    } catch (error) {
        console.error('Error uploading video:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
