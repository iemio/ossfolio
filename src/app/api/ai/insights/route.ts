import { NextRequest, NextResponse } from "next/server";
import { AIClient } from "@/lib/ai";
import { AIInsight, ContributionStats, GitHubUser } from "@/lib/types";

export async function POST(request: NextRequest) {
    try {
        const { stats, user }: { stats: ContributionStats; user: GitHubUser } =
            await request.json();

        const ai = new AIClient();

        const [summary, resume, twitterThread] = await Promise.all([
            ai.generateContributionSummary(stats),
            ai.generateOSSResume(stats, user),
            ai.generateTwitterThread(stats, user),
        ]);

        const insights: AIInsight = {
            summary,
            expertise: Object.keys(stats.languageStats),
            contributionPattern: `${stats.pullRequests.length} PRs, ${stats.issues.length} issues`,
            recommendedProjects: Object.keys(stats.contributionsByRepo).slice(
                0,
                5
            ),
            strengths: [], // TODO: Derive from PR analysis
            resume,
            twitterThread,
        };

        return NextResponse.json(insights);
    } catch (error) {
        console.error("Error generating AI insights:", error);
        return NextResponse.json(
            { error: "Failed to generate insights" },
            { status: 500 }
        );
    }
}
