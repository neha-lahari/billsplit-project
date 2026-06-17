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
    const API = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const fetchFriendData = async () => {
            try {
                const res = await fetch(`${API}/api/friends/status`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
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
    }, [API, token]);

    const handleSearch = async () => {
        if (!search.trim()) {
            setSearchResults([]);
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch(
                `${API}/api/friends/search?query=${encodeURIComponent(search)}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
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
            const res = await fetch(`${API}/api/friends/request/${userId}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Failed to send request");
                return;
            }

            setSentRequests((prev) => [
                ...prev,
                searchResults.find((u) => u._id === userId),
            ]);

            setSearchResults((prev) =>
                prev.map((u) =>
                    u._id === userId ? { ...u, requestSent: true } : u
                )
            );
        } catch (err) {
            console.error("Add friend failed:", err);
            setError("Failed to send friend request");
        }
    };

    const handleCancelRequest = async (userId) => {
        try {
            const res = await fetch(`${API}/api/friends/cancel/${userId}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error("Failed to cancel request");

            setSentRequests((prev) => prev.filter((r) => r._id !== userId));

            setSearchResults((prev) =>
                prev.map((u) =>
                    u._id === userId ? { ...u, requestSent: false } : u
                )
            );
        } catch (err) {
            console.error("Cancel request failed:", err);
            setError("Failed to cancel request");
        }
    };

    const handleAccept = async (userId) => {
        try {
            const res = await fetch(`${API}/api/friends/accept/${userId}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.msg || "Failed to accept request");
                return;
            }

            const acceptedUser = incomingRequests.find((u) => u._id === userId);
            setIncomingRequests((prev) => prev.filter((u) => u._id !== userId));
            setFriends((prev) => [...prev, acceptedUser]);
        } catch (err) {
            console.error("Accept failed:", err);
            setError("Failed to accept request");
        }
    };

    const handleReject = async (userId) => {
        try {
            const res = await fetch(`${API}/api/friends/reject/${userId}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error("Failed to reject request");

            setIncomingRequests((prev) => prev.filter((u) => u._id !== userId));
        } catch (err) {
            console.error("Reject failed:", err);
            setError("Failed to reject request");
        }
    };

    const handleUnfriend = async (userId) => {
        if (!window.confirm("Are you sure you want to unfriend this person?"))
            return;

        try {
            const res = await fetch(`${API}/api/friends/unfriend/${userId}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error("Failed to unfriend");

            setFriends((prev) => prev.filter((u) => u._id !== userId));
        } catch (err) {
            console.error("Unfriend failed:", err);
            setError("Failed to unfriend user");
        }
    };

    const getButtonState = (userId) => {
        if (friends.some((f) => f._id === userId)) return "friend";
        if (sentRequests.some((r) => r._id === userId)) return "pending";
        if (incomingRequests.some((r) => r._id === userId)) return "incoming";
        return "add";
    };

    return (
        <div className="max-w-4xl mx-auto text-slate-200 space-y-10">

            <div>
                <h2 className="text-xl font-semibold text-green-300">Friends</h2>
                <p className="text-sm text-slate-400 mt-1">
                    Manage your connections and requests
                </p>
            </div>

            {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-200 rounded-lg p-4 text-sm">
                    {error}
                </div>
            )}

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

                {/* Search Results */}
                {searchResults.length > 0 && (
                    <div className="space-y-2 mt-2">
                        {searchResults.map((user) => {
                            const state = getButtonState(user._id);
                            return (
                                <div
                                    key={user._id}
                                    className="flex items-center justify-between bg-slate-900 rounded-lg px-4 py-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={
                                                user.profilePic
                                                    ? `${API}${user.profilePic}`
                                                    : "https://placehold.co/40"
                                            }
                                            alt={user.username}
                                            className="w-9 h-9 rounded-full object-cover border border-green-400/30"
                                        />
                                        <div>
                                            <p className="text-sm font-medium">{user.username}</p>
                                            <p className="text-xs text-slate-400">{user.email}</p>
                                        </div>
                                    </div>

                                    {state === "friend" && (
                                        <span className="text-xs text-green-400">Friends ✓</span>
                                    )}
                                    {state === "pending" && (
                                        <button
                                            onClick={() => handleCancelRequest(user._id)}
                                            className="text-xs px-3 py-1 rounded-lg bg-slate-700 border border-slate-600 text-slate-300 hover:bg-slate-600 transition"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                    {state === "incoming" && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAccept(user._id)}
                                                className="text-xs px-3 py-1 rounded-lg bg-green-500/20 border border-green-400/40 text-green-300 hover:bg-green-500/30 transition"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleReject(user._id)}
                                                className="text-xs px-3 py-1 rounded-lg bg-red-500/20 border border-red-400/40 text-red-300 hover:bg-red-500/30 transition"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                    {state === "add" && (
                                        <button
                                            onClick={() => handleAddFriend(user._id)}
                                            className="text-xs px-3 py-1 rounded-lg bg-green-500/20 border border-green-400/40 text-green-300 hover:bg-green-500/30 transition"
                                        >
                                            Add
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {searchResults.length === 0 && search && !loading && (
                    <p className="text-sm text-slate-500 mt-2">No users found.</p>
                )}
            </div>

            {/* Incoming Requests */}
            {incomingRequests.length > 0 && (
                <div className="bg-slate-800/60 border border-green-900/30 rounded-2xl p-6 space-y-3">
                    <h3 className="text-sm font-medium text-slate-300">
                        Incoming Requests ({incomingRequests.length})
                    </h3>
                    {incomingRequests.map((user) => (
                        <div
                            key={user._id}
                            className="flex items-center justify-between bg-slate-900 rounded-lg px-4 py-3"
                        >
                            <div className="flex items-center gap-3">
                                <img
                                    src={
                                        user.profilePic
                                            ? `${API}${user.profilePic}`
                                            : "https://placehold.co/40"
                                    }
                                    alt={user.username}
                                    className="w-9 h-9 rounded-full object-cover border border-green-400/30"
                                />
                                <div>
                                    <p className="text-sm font-medium">{user.username}</p>
                                    <p className="text-xs text-slate-400">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleAccept(user._id)}
                                    className="text-xs px-3 py-1 rounded-lg bg-green-500/20 border border-green-400/40 text-green-300 hover:bg-green-500/30 transition"
                                >
                                    Accept
                                </button>
                                <button
                                    onClick={() => handleReject(user._id)}
                                    className="text-xs px-3 py-1 rounded-lg bg-red-500/20 border border-red-400/40 text-red-300 hover:bg-red-500/30 transition"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Sent Requests */}
            {sentRequests.length > 0 && (
                <div className="bg-slate-800/60 border border-green-900/30 rounded-2xl p-6 space-y-3">
                    <h3 className="text-sm font-medium text-slate-300">
                        Sent Requests ({sentRequests.length})
                    </h3>
                    {sentRequests.map((user) => (
                        <div
                            key={user._id}
                            className="flex items-center justify-between bg-slate-900 rounded-lg px-4 py-3"
                        >
                            <div className="flex items-center gap-3">
                                <img
                                    src={
                                        user.profilePic
                                            ? `${API}${user.profilePic}`
                                            : "https://placehold.co/40"
                                    }
                                    alt={user.username}
                                    className="w-9 h-9 rounded-full object-cover border border-green-400/30"
                                />
                                <div>
                                    <p className="text-sm font-medium">{user.username}</p>
                                    <p className="text-xs text-slate-400">{user.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleCancelRequest(user._id)}
                                className="text-xs px-3 py-1 rounded-lg bg-slate-700 border border-slate-600 text-slate-300 hover:bg-slate-600 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Friends List */}
            <div className="bg-slate-800/60 border border-green-900/30 rounded-2xl p-6 space-y-3">
                <h3 className="text-sm font-medium text-slate-300">
                    My Friends ({friends.length})
                </h3>
                {friends.length === 0 ? (
                    <p className="text-sm text-slate-500">No friends yet. Search and add some!</p>
                ) : (
                    friends.map((user) => (
                        <div
                            key={user._id}
                            className="flex items-center justify-between bg-slate-900 rounded-lg px-4 py-3"
                        >
                            <div className="flex items-center gap-3">
                                <img
                                    src={
                                        user.profilePic
                                            ? `${API}${user.profilePic}`
                                            : "https://placehold.co/40"
                                    }
                                    alt={user.username}
                                    className="w-9 h-9 rounded-full object-cover border border-green-400/30"
                                />
                                <div>
                                    <p className="text-sm font-medium">{user.username}</p>
                                    <p className="text-xs text-slate-400">{user.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleUnfriend(user._id)}
                                className="text-xs px-3 py-1 rounded-lg bg-red-500/10 border border-red-400/30 text-red-400 hover:bg-red-500/20 transition"
                            >
                                Unfriend
                            </button>
                        </div>
                    ))
                )}
            </div>

        </div>
    );
}