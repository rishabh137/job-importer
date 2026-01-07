"use client";

import { useEffect, useState } from "react";

const PAGE_SIZE = 5;

export default function ImportHistoryPage() {
    const [logs, setLogs] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);

    useEffect(() => {
        async function fetchLogs() {
            try {
                setLoading(true);

                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/import-logs?page=${page}&limit=${PAGE_SIZE}`
                );

                const result = await res.json();

                setLogs(result.data || []);
                setTotalPages(result.totalPages || 1);
            } catch (err) {
                console.error("Failed to load import logs", err);
            } finally {
                setLoading(false);
            }
        }

        fetchLogs();
    }, [page]);

    const runImport = async () => {
        try {
            setImporting(true);

            await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/import-jobs`,
                { method: "POST" }
            );

            setTimeout(() => {
                setPage(1);
            }, 1000);
        } catch (err) {
            console.error("Failed to run import", err);
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 p-8">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-semibold">Import History</h1>

                <button
                    onClick={runImport}
                    disabled={importing}
                    className={`px-4 py-2 rounded text-sm text-white cursor-pointer
                        ${importing
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                >
                    {importing ? "Running Import..." : "Run Import"}
                </button>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white min-h-[320px]">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium">Source</th>
                            <th className="px-4 py-3 text-center font-medium">Total</th>
                            <th className="px-4 py-3 text-center font-medium">Imported</th>
                            <th className="px-4 py-3 text-center font-medium">Failed</th>
                            <th className="px-4 py-3 text-left font-medium">Run Time</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="py-0">
                                    <div className="flex items-center justify-center h-[260px] text-gray-500 gap-2">
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700"></span>
                                        Loading import history...
                                    </div>
                                </td>
                            </tr>
                        ) : logs.length > 0 ? (
                            logs.map((log) => (
                                <tr
                                    key={log._id}
                                    className="border-t border-gray-200 hover:bg-gray-50"
                                >
                                    <td className="px-4 py-3 break-all">{log.fileName}</td>
                                    <td className="px-4 py-3 text-center">{log.totalFetched}</td>
                                    <td className="px-4 py-3 text-center text-green-600 font-medium">
                                        {log.totalImported}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {log.failedJobs.length > 0 ? (
                                            <button
                                                onClick={() => setSelectedLog(log)}
                                                className="text-red-600 underline hover:text-red-800"
                                            >
                                                {log.failedJobs.length}
                                            </button>
                                        ) : (
                                            <span className="text-gray-400">0</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center py-8 text-gray-500">
                                    No import history found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end items-center gap-3 mt-4">
                <button
                    disabled={page === 1 || loading}
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50 cursor-pointer"
                >
                    Prev
                </button>

                <span className="text-sm">
                    Page {page} of {totalPages}
                </span>

                <button
                    disabled={page === totalPages || loading}
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50 cursor-pointer"
                >
                    Next
                </button>
            </div>

            {selectedLog && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">
                                Failed Jobs ({selectedLog.failedJobs.length})
                            </h2>

                            <button
                                onClick={() => setSelectedLog(null)}
                                className="text-gray-500 hover:text-black text-xl"
                            >
                                ×
                            </button>
                        </div>

                        {selectedLog.failedJobs.length === 0 ? (
                            <p className="text-gray-500">No failed jobs for this import.</p>
                        ) : (
                            <div className="max-h-80 overflow-y-auto border rounded">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-3 py-2 text-left">Reason</th>
                                            <th className="px-3 py-2 text-left">Job</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedLog.failedJobs.map((fail, idx) => (
                                            <tr key={idx} className="border-t">
                                                <td className="px-3 py-2 text-red-600">
                                                    {fail.reason || "Unknown error"}
                                                </td>
                                                <td className="px-3 py-2 break-all text-gray-700">
                                                    {fail.job?.title || "N/A"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
