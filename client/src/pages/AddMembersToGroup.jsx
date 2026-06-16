import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function AddMembersToGroup() {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const [availableFriends, setAvailableFriends] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const fetchFriendsAndGroup = async () => {
            try {
                const groupRes = await fetch(`http://localhost:5000/api/groups/${groupId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });

                if (!groupRes.ok) {
                    throw new Error("Failed to fetch group");
                }

                const groupData = await groupRes.json();
                const existingMemberNames = groupData.group.members.map(m => m.username);

                let friendRes;
                try {
                    friendRes = await fetch("http://localhost:5000/api/users/friends", {
                        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                    });
                } catch (err) {
                    friendRes = await fetch("http://localhost:5000/api/friends", {
                        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                    });
                }

                if (!friendRes.ok) {
                    throw new Error("Failed to fetch friends");
                }

                const friendData = await friendRes.json();
                
                let friends = [];
                if (Array.isArray(friendData.friends)) {
                    friends = friendData.friends;
                } else if (Array.isArray(friendData.data)) {
                    friends = friendData.data;
                } else if (Array.isArray(friendData)) {
                    friends = friendData;
                }

                const availableFriendsNotInGroup = friends.filter(
                    f => !existingMemberNames.includes(f.username)
                );

                setAvailableFriends(availableFriendsNotInGroup);
                setLoading(false);
            } catch (err) {
                console.error("Fetch error:", err);
                setError("Error loading data: " + err.message);
                setLoading(false);
            }
        };

        fetchFriendsAndGroup();
    }, [groupId]);

    const handleSelectMember = (username) => {
        if (selectedMembers.includes(username)) {
            setSelectedMembers(selectedMembers.filter(m => m !== username));
        } else {
            setSelectedMembers([...selectedMembers, username]);
        }
    };

    const handleAddMembers = async () => {
        if (selectedMembers.length === 0) {
            setError("Please select at least one member");
            return;
        }

        try {
            const res = await fetch(`http://localhost:5000/api/groups/${groupId}/addMembers`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ members: selectedMembers }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.message || "Failed to add members");
                return;
            }

            setSuccess("Members added successfully!");
            setSelectedMembers([]);
            setTimeout(() => navigate(`/group/${groupId}`), 2000);
        } catch (err) {
            setError("Error adding members: " + err.message);
        }
    };

    if (loading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-slate-600 border-t-slate-300 rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="px-6 md:px-10 py-8 max-w-2xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-slate-100 mb-6">Add Members to Group</h2>

                {error && (
                    <div className="mb-4 p-4 bg-red-500/20 border border-red-500 text-red-200 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-4 bg-green-500/20 border border-green-500 text-green-200 rounded-lg text-sm">
                        {success}
                    </div>
                )}

                {availableFriends.length === 0 ? (
                    <div className="text-center text-slate-400 py-8">
                        <p className="mb-4">No friends available to add</p>
                        <p className="text-sm">(All your friends are already in this group)</p>
                        <button
                            onClick={() => navigate(`/group/${groupId}`)}
                            className="mt-6 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl transition"
                        >
                            Back to Group
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="space-y-3 mb-6">
                            {availableFriends.map((friend) => (
                                <label
                                    key={friend._id}
                                    className="flex items-center p-4 bg-slate-700/50 hover:bg-slate-700/70 rounded-lg cursor-pointer transition border border-slate-600/30"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedMembers.includes(friend.username)}
                                        onChange={() => handleSelectMember(friend.username)}
                                        className="w-5 h-5 rounded accent-slate-400 cursor-pointer"
                                    />
                                    <span className="ml-3 text-slate-200 font-medium">{friend.username}</span>
                                </label>
                            ))}
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={handleAddMembers}
                                disabled={selectedMembers.length === 0}
                                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:opacity-50 text-slate-100 rounded-xl transition font-semibold disabled:cursor-not-allowed"
                            >
                                Add {selectedMembers.length > 0 ? `(${selectedMembers.length})` : ""} Members
                            </button>
                            <button
                                onClick={() => navigate(`/group/${groupId}`)}
                                className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl transition font-semibold"
                            >
                                Cancel
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default AddMembersToGroup;