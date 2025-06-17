import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}
//eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getPRType(pr: any): string {
    const title = pr.title.toLowerCase();
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    const labels = pr.labels.map((l: any) => l.name.toLowerCase());

    if (
        labels.includes("bug") ||
        labels.includes("bugfix") ||
        title.includes("fix")
    ) {
        return "bugfix";
    }
    if (
        labels.includes("feature") ||
        labels.includes("enhancement") ||
        title.includes("add")
    ) {
        return "feature";
    }
    if (
        labels.includes("documentation") ||
        labels.includes("docs") ||
        title.includes("doc")
    ) {
        return "documentation";
    }
    if (labels.includes("test") || title.includes("test")) {
        return "test";
    }

    return "other";
}

//eslint-disable-next-line @typescript-eslint/no-explicit-any
export function calculateContributionScore(stats: any): number {
    return (
        stats.pullRequests.length * 3 +
        stats.issues.length * 2 +
        stats.codeReviews.length * 1
    );
}
