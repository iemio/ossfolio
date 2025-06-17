import { GoogleGenerativeAI } from "@google/generative-ai";
import { ContributionStats, GitHubUser, PullRequest } from "./types";

export class AIClient {
    private genAI: GoogleGenerativeAI;

    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    }

    async generateContributionSummary(
        stats: ContributionStats
    ): Promise<string> {
        const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
    Analyze the following GitHub contribution data and provide a concise professional summary:

    Pull Requests: ${stats.pullRequests.length}
    Issues: ${stats.issues.length}
    Repositories: ${stats.repositories.length}

    Recent PRs:
    ${stats.pullRequests
        .slice(0, 5)
        .map(
            (pr) =>
                `- ${pr.title} (${pr.base.repo.name}) - ${pr.additions}+ ${pr.deletions}- lines`
        )
        .join("\n")}

    Languages: ${Object.keys(stats.languageStats).join(", ")}

    Provide a 2-3 sentence professional summary focusing on:
    1. Main areas of contribution
    2. Technical expertise
    3. Contribution patterns
    `;

        const result = await model.generateContent(prompt);
        return result.response.text();
    }

    async generateOSSResume(
        stats: ContributionStats,
        user: GitHubUser
    ): Promise<string> {
        const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
    Create a professional OSS resume in markdown format for ${
        user.name || user.login
    }:

    Profile:
    - GitHub: ${user.login}
    - Bio: ${user.bio || "Open source contributor"}
    - Location: ${user.location || "Global"}
    - Followers: ${user.followers}

    Contributions:
    - ${stats.pullRequests.length} Pull Requests
    - ${stats.issues.length} Issues
    - ${stats.repositories.length} Repository interactions

    Top Projects:
    ${Object.entries(stats.contributionsByRepo)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([repo, count]) => `- ${repo}: ${count} contributions`)
        .join("\n")}

    Create a professional resume with sections:
    1. Summary
    2. Technical Skills
    3. Notable Open Source Contributions
    4. Projects & Impact
    `;

        const result = await model.generateContent(prompt);
        return result.response.text();
    }

    async generateTwitterThread(
        stats: ContributionStats,
        user: GitHubUser
    ): Promise<string[]> {
        const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
    Create an engaging Twitter thread about ${
        user.login
    }'s recent OSS contributions:

    Stats:
    - ${stats.pullRequests.length} PRs
    - ${stats.issues.length} Issues
    - Top repos: ${Object.keys(stats.contributionsByRepo)
        .slice(0, 3)
        .join(", ")}

    Recent highlights:
    ${stats.pullRequests
        .slice(0, 3)
        .map((pr) => `- ${pr.title} in ${pr.base.repo.name}`)
        .join("\n")}

    Create 4-6 tweets for a thread, starting with "🧵 My OSS journey this month:"
    Use emojis, keep it professional but engaging.
    Include hashtags like #OpenSource #GitHub #TechCommunity
    `;

        const result = await model.generateContent(prompt);
        const thread = result.response.text();

        return thread.split("\n\n").filter((tweet) => tweet.trim().length > 0);
    }

    async generatePRSummary(pr: PullRequest): Promise<string> {
        const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
    Summarize this pull request in 1-2 sentences:

    Title: ${pr.title}
    Repository: ${pr.base.repo.name}
    Changes: ${pr.additions} additions, ${pr.deletions} deletions
    Files: ${pr.changed_files} files changed
    Labels: ${pr.labels.map((l) => l.name).join(", ")}

    Focus on what was implemented/fixed and the technical impact.
    `;

        const result = await model.generateContent(prompt);
        return result.response.text();
    }
}
