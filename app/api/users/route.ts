import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/user-helper";

export async function POST(request: NextRequest) {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getOrCreateUser(user);
    if (!dbUser) {
      return NextResponse.json({ error: "User email or ID not found" }, { status: 400 });
    }

    return NextResponse.json({ user: dbUser });
}