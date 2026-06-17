import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Groups() {
    const navigate = useNavigate();
    const [groups, setGroups] = useState([]);

    const username = localStorage.getItem("username") || "User";
    const myId = localStorage.getItem("userId");
    const API = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const res = await fetch(`${API}/api/groups/my`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                const data = await res.json();

                if (Array.isArray(data.groups)) {
                    setGroups(data.groups);
                } else {
                    setGroups([]);
                }
            } catch (err) {
                console.error("Error fetching groups:", err);
                setGroups([]);
            }
        };

        fetchGroups();
    }, [API]);

    const handleDelete = async (groupId) => {
        try {
            const res = await fetch(`${API}/api/groups/${groupId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            const data = await res.json();

            if (res.ok) {
                alert("Group deleted");
                setGroups((prev) => prev.filter((g) => g._id !== groupId));
            } else {
                alert(data.message || "Delete failed");
            }
        } catch (err) {
            alert("Something went wrong: " + err.message);
        }
    };

    return (
        <div className="text-slate-200">

            <div className="flex items-center justify-between mb-10">
                <div>
                    <h2 className="text-2xl font-semibold text-green-300">
                        Welcome, {username}
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Manage your shared expenses
                    </p>
                </div>

                <button
                    onClick={() => navigate("/dashboard/groups/create")}
                    className="px-5 py-2 rounded-lg bg-green-500/20 border border-green-400/40 text-green-300 text-sm font-medium hover:bg-green-500/30 transition"
                >
                    + Create Group
                </button>
            </div>

            <h3 className="text-lg font-semibold text-slate-300 mb-6">
                Your Groups
            </h3>

            {groups?.length > 0 ? (
                <div className="space-y-4">
                    {groups.map((group) => {
                        const isOwner =
                            (group.createdBy?._id || group.createdBy) === myId;

                        return (
                            <div
                                key={group._id}
                                className="flex items-center justify-between bg-slate-800/60 border border-green-900/30 rounded-xl px-6 py-4 hover:border-green-500/40 transition"
                            >
                                <span className="text-base font-medium text-slate-200">
                                    {group.name}
                                </span>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() =>
                                            navigate(`/group/${group._id}`)
                                        }
                                        className="px-4 py-1.5 text-sm rounded-md bg-green-500/15 text-green-300 border border-green-400/30 hover:bg-green-500/25 transition"
                                    >
                                        View
                                    </button>

                                    {isOwner && (
                                        <button
                                            onClick={() =>
                                                handleDelete(group._id)
                                            }
                                            className="px-4 py-1.5 text-sm rounded-md bg-red-500/15 text-red-300 border border-red-400/30 hover:bg-red-500/25 transition"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="mt-10 text-center text-slate-400 text-sm">
                    You don't have any groups yet.
                </div>
            )}
        </div>
    );
}

export default Groups;