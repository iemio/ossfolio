"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ContributionDashboard from "@/components/ContributionDashboard";

export default function Home() {
    const [username, setUsername] = useState("");
    const [currentUser, setCurrentUser] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim()) {
            setCurrentUser(username.trim());
        }
    };

    if (currentUser) {
        return <ContributionDashboard username={currentUser} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">
                        GitHub OSS Contribution Analyzer
                    </h1>
                    <p className="text-xl text-gray-600 mb-12">
                        Analyze your open source contributions with AI-powered
                        insights, generate professional resumes, and create
                        engaging social media content.
                    </p>

                    <Card className="max-w-md mx-auto">
                        <CardHeader>
                            <CardTitle>Enter GitHub Username</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Input
                                    type="text"
                                    placeholder="e.g., octocat"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                    className="w-full"
                                />
                                <Button type="submit" className="w-full">
                                    Analyze Contributions
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="text-4xl mb-4">🟦</div>
                            <h3 className="text-lg font-semibold mb-2">
                                Pull Requests
                            </h3>
                            <p className="text-gray-600">
                                Track PRs with AI summaries, file changes, and
                                contribution patterns
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl mb-4">🟧</div>
                            <h3 className="text-lg font-semibold mb-2">
                                Issues & Reviews
                            </h3>
                            <p className="text-gray-600">
                                Monitor issue creation, comments, and code
                                review activities
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl mb-4">🧠</div>
                            <h3 className="text-lg font-semibold mb-2">
                                AI Insights
                            </h3>
                            <p className="text-gray-600">
                                Get intelligent analysis of your contribution
                                patterns and expertise
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl mb-4">📢</div>
                            <h3 className="text-lg font-semibold mb-2">
                                Social Content
                            </h3>
                            <p className="text-gray-600">
                                Generate OSS resumes and Twitter threads
                                automatically
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
