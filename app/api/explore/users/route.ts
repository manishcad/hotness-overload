import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        const currentUserId = session?.user ? (session.user as any).id : null;

        // Fetch users sorted by creation date (newest first)
        // Limit to 20 for now
        // Exclude the current user if logged in
        const query = currentUserId ? { _id: { $ne: currentUserId } } : {};

        const users = await User.find(query)
            .sort({ createdAt: -1 })
            .limit(20)
            .select('name email image followers createdAt');

        return NextResponse.json({ users }, { status: 200 });
    } catch (error) {
        console.error("Error fetching explore users:", error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
