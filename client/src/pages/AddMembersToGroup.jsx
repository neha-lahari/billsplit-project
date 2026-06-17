import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API = process.env.REACT_APP_API_URL;

function AddMembersToGroup() {
    const { groupId } = useParams();
    const navigate = useNavigate();

    const [availableFriends, setAvailableFriends] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchFriendsAndGroup = async () => {
            try {
                const groupRes = await fetch(`${API}/api/groups/${groupId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!groupRes.ok) throw new Error("Failed to fetch group");

                const groupData = await groupRes.json();

                const existingMemberNames =
                    groupData.group.members.map((m) => m.username);

                let friendRes = await fetch(`${API}/api/users/friends`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!friendRes.ok) {
                    friendRes = await fetch(`${API}/api/friends`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                }

                if (!friendRes.ok) throw new Error("Failed to fetch friends");

                const friendData = await friendRes.json();

                const friends =
                    friendData.friends ||
                    friendData.data ||
                    friendData ||
                    [];

                const available = friends.filter(
                    (f) => !existingMemberNames.includes(f.username)
                );

                setAvailableFriends(available);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFriendsAndGroup();
    }, [groupId, token]);

    const handleSelectMember = (username) => {
        setSelectedMembers((prev) =>
            prev.includes(username)
                ? prev.filter((m) => m !== username)
                : [...prev, username]
        );
    };

    const handleAddMembers = async () => {
        if (selectedMembers.length === 0) {
            setError("Please select at least one member");
            return;
        }

        try {
            const res = await fetch(
                `${API}/api/groups/${groupId}/addMembers`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ members: selectedMembers }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Failed to add members");
                return;
            }

            setSuccess("Members added successfully!");
            setSelectedMembers([]);

            setTimeout(() => {
                navigate(`/group/${groupId}`);
            }, 1500);
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return (
            <div className="h-96 flex items-center justify-center text-slate-400">
                Loading...
            </div>
        );
    }

    return (
        <div className="px-6 md:px-10 py-8 max-w-2xl mx-auto">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">

                <h2 className="text-2xl font-bold text-slate-100 mb-6">
                    Add Members to Group
                </h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/20 text-red-200 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-3 bg-green-500/20 text-green-200 rounded-lg text-sm">
                        {success}
                    </div>
                )}

                {availableFriends.length === 0 ? (
                    <div className="text-slate-400 text-center py-8">
                        No friends available to add
                        <button
                            onClick={() => navigate(`/group/${groupId}`)}
                            className="block mt-4 px-4 py-2 bg-slate-700 rounded-lg"
                        >
                            Back
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="space-y-3 mb-6">
                            {availableFriends.map((friend) => (
                                <label
                                    key={friend._id}
                                    className="flex items-center gap-3 p-3 bg-slate-700/40 rounded-lg cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedMembers.includes(friend.username)}
                                        onChange={() =>
                                            handleSelectMember(friend.username)
                                        }
                                    />
                                    <span>{friend.username}</span>
                                </label>
                            ))}
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={handleAddMembers}
                                className="flex-1 bg-green-600 py-2 rounded-lg"
                            >
                                Add ({selectedMembers.length})
                            </button>

                            <button
                                onClick={() => navigate(`/group/${groupId}`)}
                                className="flex-1 bg-slate-700 py-2 rounded-lg"
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