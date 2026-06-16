import React, { useState, useEffect } from "react";

export default function Friends() {
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [friends, setFriends] = useState([]);
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchFriendData = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/friends/status", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                setFriends(data.friends || []);
                setIncomingRequests(data.incomingRequests || []);
                setSentRequests(data.sentRequests || []);
            } catch (err) {
                console.error("Failed to load friends/status:", err);
                setError("Failed to load friend data");
            }
        };
        fetchFriendData();
    }, [token]);

    const handleSearch = async () => {
        if (!search.trim()) {
            setSearchResults([]);
            return;
        }
        setLoading(true);
        setError("");

        try {
            const res = await fetch(
                `http://localhost:5000/api/friends/search?query=${encodeURIComponent(search)}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!res.ok) throw new Error("Search failed");

            const data = await res.json();
            setSearchResults(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Search failed:", err);
            setError("Search failed. Please try again.");
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddFriend = async (userId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/friends/request/${userId}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.message || "Failed to send request");
                return;
            }

            setSentRequests(prev => [...prev, searchResults.find(u => u._id === userId)]);
            setSearchResults(prev =>
                prev.map(u => u._id === userId ? { ...u, requestSent: true } : u)
            );
        } catch (err) {
            console.error("Add friend failed:", err);
            setError("Failed to send friend request");
        }
    };

    const handleCancelRequest = async (userId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/friends/cancel/${userId}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Failed to cancel request");

            setSentRequests(prev => prev.filter(r => r._id !== userId));
            setSearchResults(prev =>
                prev.map(u => u._id === userId ? { ...u, requestSent: false } : u)
            );
        } catch (err) {
            console.error("Cancel request failed:", err);
            setError("Failed to cancel request");
        }
    };

    const handleAccept = async (userId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/friends/accept/${userId}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.msg || "Failed to accept request");
                return;
            }

            const acceptedUser = incomingRequests.find(u => u._id === userId);
            setIncomingRequests(prev => prev.filter(u => u._id !== userId));
            setFriends(prev => [...prev, acceptedUser]);
        } catch (err) {
            console.error("Accept failed:", err);
            setError("Failed to accept request");
        }
    };

    const handleReject = async (userId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/friends/reject/${userId}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to reject request");

            setIncomingRequests(prev => prev.filter(u => u._id !== userId));
        } catch (err) {
            console.error("Reject failed:", err);
            setError("Failed to reject request");
        }
    };

    const handleUnfriend = async (userId) => {
        if (!window.confirm("Are you sure you want to unfriend this person?")) return;

        try {
            const res = await fetch(`http://localhost:5000/api/friends/unfriend/${userId}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to unfriend");

            setFriends(prev => prev.filter(u => u._id !== userId));
        } catch (err) {
            console.error("Unfriend failed:", err);
            setError("Failed to unfriend user");
        }
    };

    const getButtonState = (userId) => {
        if (friends.some(f => f._id === userId)) return "friend";
        if (sentRequests.some(r => r._id === userId)) return "pending";
        if (incomingRequests.some(r => r._id === userId)) return "incoming";
        return "add";
    };

    return (
        <div className="max-w-4xl mx-auto text-slate-200 space-y-10">
            <div>
                <h2 className="text-xl font-semibold text-green-300">Friends</h2>
                <p className="text-sm text-slate-400 mt-1">Manage your connections and requests</p>
            </div>

            {error && <div className="bg-red-500/20 border border-red-500 text-red-200 rounded-lg p-4 text-sm">{error}</div>}

            {/* Search */}
            <div className="bg-slate-800/60 border border-green-900/30 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-medium text-slate-300">Find Friends</h3>
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                        placeholder="Search by username or email"
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-green-400 transition"
                    />
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="px-4 py-2 text-sm rounded-lg bg-green-500/20 border border-green-400/40 text-green-300 hover:bg-green-500/30 transition disabled:opacity-50"
                    >
                        {loading ? "Searching..." : "Search"}
                    </button>
                </div>

                {searchResults.length > 0 && (
                    <div className="space-y-3 mt-4">
                        {searchResults.map(u => {
                            const state = getButtonState(u._id);
                            return (
                                <div key={u._id} className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-lg px-4 py-3">
                                    <div className="text-sm text-slate-300">
                                        {u.username} <span className="text-slate-500 ml-2 text-xs">({u.email})</span>
                                    </div>
                                    {state === "friend" ? (
                                        <button onClick={() => handleUnfriend(u._id)} className="text-xs px-3 py-1.5 rounded-md border border-red-400/40 text-red-400 hover:bg-red-500/20 transition">
                                            Unfriend
                                        </button>
                                    ) : state === "pending" ? (
                                        <button onClick={() => handleCancelRequest(u._id)} className="text-xs px-3 py-1.5 rounded-md border border-yellow-400/40 text-yellow-400 hover:bg-yellow-500/20 transition">
                                            Cancel
                                        </button>
                                    ) : (
                                        <button onClick={() => handleAddFriend(u._id)} className="text-xs px-3 py-1.5 rounded-md border border-green-400/40 text-green-300 hover:bg-green-500/20 transition">
                                            Add
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Incoming Requests */}
            <div className="bg-slate-800/60 border border-green-900/30 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-medium text-slate-300">Incoming Requests ({incomingRequests.length})</h3>
                {incomingRequests.length > 0 ? (
                    <div className="space-y-3">
                        {incomingRequests.map(u => (
                            <div key={u._id} className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-lg px-4 py-3">
                                <div className="text-sm text-slate-300">
                                    {u.username} <span className="text-slate-500 ml-2 text-xs">({u.email})</span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleAccept(u._id)} className="text-xs px-3 py-1.5 rounded-md border border-green-400/40 text-green-300 hover:bg-green-500/20 transition">Accept</button>
                                    <button onClick={() => handleReject(u._id)} className="text-xs px-3 py-1.5 rounded-md border border-red-400/40 text-red-400 hover:bg-red-500/20 transition">Reject</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-xs text-slate-500">No incoming requests</p>}
            </div>

            {/* Your Friends */}
            <div className="bg-slate-800/60 border border-green-900/30 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-medium text-slate-300">Your Friends ({friends.length})</h3>
                {friends.length > 0 ? (
                    <div className="space-y-3">
                        {friends.map(u => (
                            <div key={u._id} className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-lg px-4 py-3">
                                <div className="text-sm text-slate-300">
                                    {u.username} <span className="text-slate-500 ml-2 text-xs">({u.email})</span>
                                </div>
                                <button onClick={() => handleUnfriend(u._id)} className="text-xs px-3 py-1.5 rounded-md border border-red-400/40 text-red-400 hover:bg-red-500/20 transition">
                                    Unfriend
                                </button>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-xs text-slate-500">No friends yet</p>}
            </div>
        </div>
    );
}