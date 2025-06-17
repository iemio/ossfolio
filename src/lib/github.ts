import { Octokit } from "@octokit/rest";
import { GitHubUser, Issue, PullRequest, Repository } from "./types";

export class GitHubClient {
    private octokit: Octokit;

    constructor(token?: string) {
        this.octokit = new Octokit({
            auth: token || process.env.GITHUB_TOKEN,
        });
    }

    async getUser(username: string): Promise<GitHubUser> {
        const { data } = await this.octokit.rest.users.getByUsername({
            username,
        });
        return data as GitHubUser;
    }

    async getUserPullRequests(
        username: string,
        since?: string
    ): Promise<PullRequest[]> {
        const query = `author:${username} type:pr ${
            since ? `created:>${since}` : ""
        }`;

        const { data } = await this.octokit.rest.search.issuesAndPullRequests({
            q: query,
            sort: "created",
            order: "desc",
            per_page: 100,
        });

        const prs = await Promise.all(
            data.items.map(async (item: any) => {
                const [owner, repo] = item.repository_url.split("/").slice(-2);
                const prDetails = await this.octokit.rest.pulls.get({
                    owner,
                    repo,
                    pull_number: item.number,
                });

                return {
                    ...item,
                    ...prDetails.data,
                    additions: prDetails.data.additions || 0,
                    deletions: prDetails.data.deletions || 0,
                    changed_files: prDetails.data.changed_files || 0,
                };
            })
        );

        return prs as PullRequest[];
    }

    async getUserIssues(username: string, since?: string): Promise<Issue[]> {
        const createdQuery = `author:${username} type:issue ${
            since ? `created:>${since}` : ""
        }`;
        const commentedQuery = `commenter:${username} type:issue ${
            since ? `updated:>${since}` : ""
        }`;

        const [created, commented] = await Promise.all([
            this.octokit.rest.search.issuesAndPullRequests({
                q: createdQuery,
                sort: "created",
                order: "desc",
                per_page: 50,
            }),
            this.octokit.rest.search.issuesAndPullRequests({
                q: commentedQuery,
                sort: "updated",
                order: "desc",
                per_page: 50,
            }),
        ]);

        const allIssues = [...created.data.items, ...commented.data.items];
        const uniqueIssues = allIssues.filter(
            (issue, index, self) =>
                index === self.findIndex((i) => i.id === issue.id)
        );

        return uniqueIssues.map((issue) => ({
            ...issue,
            repository: {
                name: issue.repository_url.split("/").pop() || "",
                full_name: issue.repository_url.split("/").slice(-2).join("/"),
            },
        })) as Issue[];
    }

    async getStarredRepos(username: string): Promise<Repository[]> {
        const { data } =
            await this.octokit.rest.activity.listReposStarredByUser({
                username,
                per_page: 30,
                sort: "created",
            });
        return data as Repository[];
    }
}
