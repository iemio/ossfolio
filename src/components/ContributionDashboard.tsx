"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContributionStats, GitHubUser, AIInsight } from "@/lib/types";
import {
    GitPullRequest,
    CircleDot as GitIssue,
    Star,
    MessageSquare,
} from "lucide-react";

interface Props {
    username: string;
}

export default function ContributionDashboard({ username }: Props) {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<GitHubUser | null>(null);
    const [stats, setStats] = useState<ContributionStats | null>(null);
    const [insights, setInsights] = useState<AIInsight | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState<
        "month" | "quarter" | "year"
    >("month");

    useEffect(() => {
        fetchData();
    }, [username, selectedPeriod]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch user data
            const userRes = await fetch(
                `/api/github/user?username=${username}`
            );
            const userData = await userRes.json();
            setUser(userData);

            // Calculate since date
            const now = new Date();
            const since = new Date();
            switch (selectedPeriod) {
                case "month":
                    since.setMonth(now.getMonth() - 1);
                    break;
                case "quarter":
                    since.setMonth(now.getMonth() - 3);
                    break;
                case "year":
                    since.setFullYear(now.getFullYear() - 1);
                    break;
            }

            // Fetch contributions
            const contributionsRes = await fetch(
                `/api/github/contributions?username=${username}&since=${
                    since.toISOString().split("T")[0]
                }`
            );
            const contributionData = await contributionsRes.json();
            setStats(contributionData);

            // Generate AI insights
            const insightsRes = await fetch("/api/ai/insights", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    stats: contributionData,
                    user: userData,
                }),
            });
            const insightData = await insightsRes.json();
            setInsights(insightData);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                Loading...
            </div>
        );
    }

    if (!user || !stats) {
        return <div>Error loading data</div>;
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <img
                    src={user.avatar_url}
                    alt={user.login}
                    className="w-16 h-16 rounded-full"
                />
                <div>
                    <h1 className="text-3xl font-bold">
                        {user.name || user.login}
                    </h1>
                    <p className="text-gray-600">{user.bio}</p>
                    <div className="flex items-center space-x-4 mt-2">
                        <span>{user.followers} followers</span>
                        <span>{user.public_repos} repositories</span>
                        {user.location && <span>📍 {user.location}</span>}
                    </div>
                </div>
            </div>

            {/* Period Selector */}
            <div className="flex space-x-2">
                {(["month", "quarter", "year"] as const).map((period) => (
                    <Button
                        key={period}
                        variant={
                            selectedPeriod === period ? "default" : "outline"
                        }
                        onClick={() => setSelectedPeriod(period)}
                        className="capitalize"
                    >
                        {period}
                    </Button>
                ))}
            </div>

            {/* AI Summary */}
            {insights && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            🧠 AI-Powered Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg mb-4">{insights.summary}</p>
                        <div className="flex flex-wrap gap-2">
                            {insights?.expertise?.map((skill) => (
                                <Badge key={skill} variant="secondary">
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            Pull Requests
                        </CardTitle>
                        <GitPullRequest className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.pullRequests.length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {
                                stats.pullRequests.filter(
                                    (pr) => pr.state === "open"
                                ).length
                            }{" "}
                            open
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            Issues
                        </CardTitle>
                        <GitIssue className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.issues.length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {
                                stats.issues.filter(
                                    (issue) => issue.state === "open"
                                ).length
                            }{" "}
                            open
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            Repositories
                        </CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {Object.keys(stats.contributionsByRepo).length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            contributed to
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            Code Changes
                        </CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.pullRequests.reduce(
                                (acc, pr) => acc + pr.additions + pr.deletions,
                                0
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            lines changed
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Pull Requests */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        🟦 Pull Requests
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {stats.pullRequests.slice(0, 10).map((pr) => (
                            <div
                                key={pr.id}
                                className="flex items-center justify-between p-4 border rounded-lg"
                            >
                                <div className="flex-1">
                                    <h3 className="font-medium">
                                        <a
                                            href={pr.html_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            {pr.title}
                                        </a>
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {pr.base.repo.name} •{" "}
                                        {new Date(
                                            pr.created_at
                                        ).toLocaleDateString()}
                                    </p>
                                    <div className="flex items-center space-x-4 mt-2">
                                        <span className="text-sm text-green-600">
                                            +{pr.additions}
                                        </span>
                                        <span className="text-sm text-red-600">
                                            -{pr.deletions}
                                        </span>
                                        <span className="text-sm text-gray-600">
                                            {pr.changed_files} files
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Badge
                                        variant={
                                            pr.state === "open"
                                                ? "default"
                                                : "secondary"
                                        }
                                    >
                                        {pr.state}
                                    </Badge>
                                    {pr.draft && (
                                        <Badge variant="outline">Draft</Badge>
                                    )}
                                    {pr.labels.map((label) => (
                                        <Badge
                                            key={label.name}
                                            variant="outline"
                                            style={{ color: `#${label.color}` }}
                                        >
                                            {label.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Issues */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        🟧 Issues
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {stats.issues.slice(0, 10).map((issue) => (
                            <div
                                key={issue.id}
                                className="flex items-center justify-between p-4 border rounded-lg"
                            >
                                <div className="flex-1">
                                    <h3 className="font-medium">
                                        <a
                                            href={issue.html_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            {issue.title}
                                        </a>
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {issue.repository.name} •{" "}
                                        {new Date(
                                            issue.created_at
                                        ).toLocaleDateString()}
                                    </p>
                                    {issue.comments > 0 && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            💬 {issue.comments} comments
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Badge
                                        variant={
                                            issue.state === "open"
                                                ? "default"
                                                : "secondary"
                                        }
                                    >
                                        {issue.state}
                                    </Badge>
                                    {issue.labels.map((label) => (
                                        <Badge
                                            key={label.name}
                                            variant="outline"
                                            style={{ color: `#${label.color}` }}
                                        >
                                            {label.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* AI Generated Content */}
            {insights && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* OSS Resume */}
                    <Card>
                        <CardHeader>
                            <CardTitle>🧾 AI-Generated OSS Resume</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="prose prose-sm max-w-none">
                                <pre className="whitespace-pre-wrap text-sm">
                                    {insights.resume}
                                </pre>
                            </div>
                            <Button
                                className="mt-4"
                                onClick={() =>
                                    navigator.clipboard.writeText(
                                        insights.resume
                                    )
                                }
                            >
                                Copy Resume
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Twitter Thread */}
                    <Card>
                        <CardHeader>
                            <CardTitle>📢 Twitter Thread Generator</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {insights?.twitterThread?.map(
                                    (tweet, index) => (
                                        <div
                                            key={index}
                                            className="p-3 bg-gray-50 rounded-lg"
                                        >
                                            <p className="text-sm">{tweet}</p>
                                        </div>
                                    )
                                )}
                            </div>
                            <Button
                                className="mt-4"
                                onClick={() =>
                                    navigator.clipboard.writeText(
                                        insights.twitterThread.join("\n\n")
                                    )
                                }
                            >
                                Copy Thread
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
