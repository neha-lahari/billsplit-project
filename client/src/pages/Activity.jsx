import React, { useEffect, useState } from "react";

function Activity() {
    const [activities, setActivities] = useState([]);

    const API_URL = process.env.REACT_APP_API_URL;

    const fetchActivities = async () => {
        try {
            const res = await fetch(
                `${API_URL}/api/activity`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            const data = await res.json();
            setActivities(data.activities || []);
        } catch (err) {
            console.error("Error fetching activity:", err);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    const handleDelete = async (id) => {
        const confirmed = window.confirm("Delete this activity?");
        if (!confirmed) return;

        try {
            const res = await fetch(
                `${API_URL}/api/activity/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Error deleting activity");
            }

            setActivities((prev) => prev.filter((a) => a._id !== id));
        } catch (err) {
            console.error("Error deleting activity:", err);
        }
    };

    const getMessage = (act) => {
        const groupName = act.group?.name || act.groupName || "Unnamed Group";
        const person = act.user?.username || "Someone";
        const currentUsername = localStorage.getItem("username");
        const name = person === currentUsername ? "You" : person;

        switch (act.type) {
            case "expense_added":
                return `${name} added ₹${act.amount} in ${groupName}`;
            case "expense_deleted":
                return `${name} deleted an expense in ${groupName}`;
            case "group_deleted":
                return `${name} deleted the group ${groupName}`;
            case "group_created":
                return `${name} created the group ${groupName}`;
            default:
                return `${name} did something`;
        }
    };

    return (
        <div className="max-w-3xl mx-auto text-slate-200">

            <div className="mb-8">
                <h2 className="text-xl font-semibold text-green-300">
                    Recent Activity
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                    See what’s happening in your groups
                </p>
            </div>

            {activities.length === 0 ? (
                <div className="text-slate-400 text-sm">
                    No activity yet.
                </div>
            ) : (
                <div className="space-y-4">
                    {activities.map((activity) => {
                        const isMyActivity =
                            activity.user?.username === localStorage.getItem("username");

                        return (
                            <div
                                key={activity._id}
                                className="flex items-center justify-between bg-slate-800/60 border border-green-900/30 rounded-xl px-5 py-4 hover:border-green-500/40 transition duration-200"
                            >
                                <div className="text-sm text-slate-300">
                                    {getMessage(activity)}
                                </div>

                                {isMyActivity && (
                                    <button
                                        onClick={() => handleDelete(activity._id)}
                                        className="text-xs text-red-400 hover:text-red-300 transition"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default Activity;