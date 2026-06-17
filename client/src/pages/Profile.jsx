import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = process.env.REACT_APP_API_URL;

function Profile() {
    const [user, setUser] = useState({
        username: "",
        email: "",
    });
    const navigate = useNavigate();

    const [newValues, setNewValues] = useState({
        username: "",
        email: "",
    });

    const [profilePic, setProfilePic] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(
                    `${API}/api/users/profile`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );

                const data = await res.json();
                setUser(data);
                setNewValues({
                    username: data.username,
                    email: data.email,
                });
                setProfilePic(data.profilePic || "");
            } catch (err) {
                console.error("Error fetching profile:", err);
            }
        };

        fetchProfile();
    }, []);

    const handleSave = async () => {
        try {
            const res = await fetch(
                `${API}/api/users/profile`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify(newValues),
                }
            );

            if (!res.ok) throw new Error("Failed to update");

            const updated = await res.json();
            setUser(updated);

            localStorage.setItem("username", updated.username);

            navigate("/dashboard/account");

        } catch (err) {
            console.error("Update error:", err);
            alert("Failed to update profile");
        }
    };

    const handleProfilePicUpload = async () => {
        if (!selectedFile) {
            alert("Please select an image first");
            return;
        }

        const formData = new FormData();
        formData.append("profilePic", selectedFile);

        try {
            const res = await fetch(
                `${API}/api/users/upload-profile-pic`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: formData,
                }
            );

            const data = await res.json();
            setProfilePic(data.profilePic);
            alert("Profile picture updated!");
        } catch (err) {
            console.error("Upload error:", err);
            alert("Failed to upload profile picture");
        }
    };

    return (
        <div className="max-w-4xl mx-auto text-slate-200">

            <div className="mb-8">
                <h2 className="text-xl font-semibold text-green-300">
                    Edit Profile
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                    Manage your account information
                </p>
            </div>

            <div className="bg-slate-800/60 border border-green-900/30 rounded-2xl p-8">

                <div className="flex flex-col items-center mb-8">
                    <img
                        src={
                            profilePic
                                ? `${API}${profilePic}`
                                : "https://placehold.co/120"
                        }
                        alt="Profile"
                        className="w-28 h-28 rounded-full object-cover border border-green-400/30 mb-4"
                    />

                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        className="text-sm text-slate-400 mb-3"
                    />

                    <button
                        onClick={handleProfilePicUpload}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition"
                    >
                        Upload Photo
                    </button>
                </div>

                <div className="space-y-5 max-w-md mx-auto">

                    <div>
                        <label className="block text-sm text-slate-400 mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            value={newValues.username}
                            onChange={(e) =>
                                setNewValues({ ...newValues, username: e.target.value })
                            }
                            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:border-green-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={newValues.email}
                            onChange={(e) =>
                                setNewValues({ ...newValues, email: e.target.value })
                            }
                            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:border-green-500"
                        />
                    </div>

                    <button
                        onClick={handleSave}
                        className="w-full py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition"
                    >
                        Save Changes
                    </button>

                </div>
            </div>
        </div>
    );
}

export default Profile;