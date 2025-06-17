export interface GitHubUser {
    login: string;
    id: number;
    avatar_url: string;
    name: string;
    company?: string;
    blog?: string;
    location?: string;
    email?: string;
    bio?: string;
    public_repos: number;
    followers: number;
    following: number;
    created_at: string;
}

export interface PullRequest {
    id: number;
    number: number;
    title: string;
    html_url: string;
    state: "open" | "closed";
    created_at: string;
    updated_at: string;
    merged_at?: string;
    draft: boolean;
    additions: number;
    deletions: number;
    changed_files: number;
    base: {
        repo: {
            name: string;
            full_name: string;
            html_url: string;
        };
    };
    labels: Array<{
        name: string;
        color: string;
    }>;
    user: {
        login: string;
        avatar_url: string;
    };
}

export interface Issue {
    id: number;
    number: number;
    title: string;
    html_url: string;
    state: "open" | "closed";
    created_at: string;
    updated_at: string;
    closed_at?: string;
    labels: Array<{
        name: string;
        color: string;
    }>;
    repository: {
        name: string;
        full_name: string;
    };
    comments: number;
}

export interface Repository {
    id: number;
    name: string;
    full_name: string;
    html_url: string;
    description?: string;
    language?: string;
    stargazers_count: number;
    forks_count: number;
    created_at: string;
    updated_at: string;
}

export interface ContributionStats {
    pullRequests: PullRequest[];
    issues: Issue[];
    repositories: Repository[];
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    codeReviews: any[];
    totalContributions: number;
    contributionsByRepo: Record<string, number>;
    languageStats: Record<string, number>;
}

export interface AIInsight {
    summary: string;
    expertise: string[];
    contributionPattern: string;
    recommendedProjects: string[];
    strengths: string[];
    resume: string;
    twitterThread: string[];
}
