"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function DebugDashboard() {
    const { data: session, status } = useSession();
    const [apiResponse, setApiResponse] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [headers, setHeaders] = useState<any>(null);
    const [connectionInfo, setConnectionInfo] = useState<any>(null);

    // Test when component mounts
    useEffect(() => {
        if (status === "authenticated") {
            console.log("Debug Component: User is authenticated with session", session);
        }
    }, [status, session]);

    async function testDirectFetch() {
        try {
            setLoading(true);
            setError(null);
            setApiResponse(null);
            setHeaders(null);
            setConnectionInfo(null);

            console.log("Debug: Testing direct fetch to /api/listings/user");
            const startTime = performance.now();
            const response = await fetch("/api/listings/user", {
                credentials: "include",
                headers: {
                    "Accept": "application/json"
                }
            });
            const endTime = performance.now();
            const responseTime = endTime - startTime;

            // Get headers
            const headerObj: Record<string, string> = {};
            response.headers.forEach((value, key) => {
                headerObj[key] = value;
            });
            setHeaders(headerObj);

            // Connection info
            setConnectionInfo({
                status: response.status,
                statusText: response.statusText,
                responseTime: `${responseTime.toFixed(2)}ms`,
                ok: response.ok,
                redirected: response.redirected,
                type: response.type,
            });

            console.log(`Debug: Response status: ${response.status}`);
            const data = await response.json();
            console.log("Debug: Response data:", data);
            setApiResponse(data);

            // Check for specific database errors
            if (data.error && data.message && data.message.includes('prepared statement')) {
                setError(`Database Connection Error: This is a known issue with PostgreSQL prepared statements in serverless environments. The application has been updated to handle this automatically.`);
            }

        } catch (err) {
            console.error("Debug: Error during fetch:", err);
            setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setLoading(false);
        }
    }

    async function testDatabaseReset() {
        try {
            setLoading(true);
            console.log("Debug: Testing database reset");

            const response = await fetch("/api/debug/reset-db-connection", {
                method: "POST",
                credentials: "include",
            });

            const data = await response.json();
            setApiResponse(data);
        } catch (err) {
            console.error("Debug: Error resetting database:", err);
            setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Dashboard Debug</h1>

            <div className="mb-6 p-4 border rounded-lg">
                <h2 className="text-xl font-semibold mb-2">Session Status</h2>
                <p>Current status: <strong>{status}</strong></p>
                {session && (
                    <pre className="bg-gray-100 p-2 mt-2 rounded overflow-auto max-h-96">
                        {JSON.stringify(session, null, 2)}
                    </pre>
                )}
            </div>

            <div className="mb-6 flex space-x-4">
                <button
                    onClick={testDirectFetch}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    disabled={loading}
                >
                    {loading ? "Testing..." : "Test API Call"}
                </button>

                <button
                    onClick={testDatabaseReset}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
                    disabled={loading}
                >
                    {loading ? "Resetting..." : "Reset DB Connection"}
                </button>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 p-4 rounded-lg text-red-500">
                    <p className="font-semibold">Error:</p>
                    <p>{error}</p>
                    {error.includes('prepared statement') && (
                        <div className="mt-2 p-2 bg-yellow-50 text-yellow-700 rounded">
                            <p className="font-medium">Database Connection Issue Detected</p>
                            <p className="text-sm mt-1">
                                This is a common issue with PostgreSQL in serverless environments. We've updated
                                the application to handle this automatically with connection retry logic.
                                Try clicking "Reset DB Connection" and then test the API again.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {connectionInfo && (
                <div className="mb-6 p-4 border rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">Connection Info</h2>
                    <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-40">
                        {JSON.stringify(connectionInfo, null, 2)}
                    </pre>
                </div>
            )}

            {headers && (
                <div className="mb-6 p-4 border rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">Response Headers</h2>
                    <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-40">
                        {JSON.stringify(headers, null, 2)}
                    </pre>
                </div>
            )}

            {apiResponse && (
                <div className="mb-6 p-4 border rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">API Response</h2>
                    <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-96">
                        {JSON.stringify(apiResponse, null, 2)}
                    </pre>
                </div>
            )}

            <div className="mt-8">
                <Link href="/dashboard" className="text-blue-500 underline">
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
} 