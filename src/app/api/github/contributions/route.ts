import { NextRequest, NextResponse } from "next/server";
import { GitHubClient } from "@/lib/github";
import { ContributionStats } from "@/lib/types";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");
    const since = searchParams.get("since"); // e.g., '2024-01-01'

    if (!username) {
        return NextResponse.json(
            { error: "Username required" },
            { status: 400 }
        );
    }

    try {
        const github = new GitHubClient();

        const [pullRequests, issues, repositories] = await Promise.all([
            github.getUserPullRequests(username, since || undefined),
            github.getUserIssues(username, since || undefined),
            github.getStarredRepos(username),
        ]);

        // Calculate contribution stats
        const contributionsByRepo: Record<string, number> = {};
        const languageStats: Record<string, number> = {};

        pullRequests.forEach((pr) => {
            const repoName = pr.base.repo.full_name;
            contributionsByRepo[repoName] =
                (contributionsByRepo[repoName] || 0) + 1;
        });

        repositories.forEach((repo) => {
            if (repo.language) {
                languageStats[repo.language] =
                    (languageStats[repo.language] || 0) + 1;
            }
        });

        const stats: ContributionStats = {
            pullRequests,
            issues,
            repositories,
            codeReviews: [], // TODO: Implement code review fetching
            totalContributions: pullRequests.length + issues.length,
            contributionsByRepo,
            languageStats,
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error("Error fetching contributions:", error);
        return NextResponse.json(
            { error: "Failed to fetch contribution data" },
            { status: 500 }
        );
    }
}
