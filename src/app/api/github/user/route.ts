import { NextRequest, NextResponse } from "next/server";
import { GitHubClient } from "@/lib/github";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
        return NextResponse.json(
            { error: "Username required" },
            { status: 400 }
        );
    }

    try {
        const github = new GitHubClient();
        const user = await github.getUser(username);

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch user data" },
            { status: 500 }
        );
    }
}
