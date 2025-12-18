import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Video from '@/models/Video';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Assuming we want to fetch videos for the logged-in user
        // First, we need to find the user's ID. Since we don't have direct access to ID in session easily without extra call or session modification
        // We can query videos where userId matches the user found by email. 
        // OR better, since we added userId to Video model, we can find the user first.

        // However, let's look at how we stored userId in Video model. It's an ObjectId.
        // We can get the user ID from the session if we added it to the session callback (which we did in previous steps).

        // Let's rely on the session having the ID.
        const userId = (session.user as any).id;

        if (!userId) {
            return NextResponse.json({ error: 'User ID not found in session' }, { status: 400 });
        }

        const videos = await Video.find({ userId })
            .sort({ createdAt: -1 })
            .populate({
                path: 'comments.userId',
                select: 'name image'
            });

        return NextResponse.json({ videos });
    } catch (error) {
        console.error('Error fetching user videos:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
