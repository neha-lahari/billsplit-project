import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import fingerprint from "../assets/fingerprint.png";

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleReset = async (e) => {
        e.preventDefault();
        setError("");

        if (newPassword.length < 6) {
            return setError("Password must be at least 6 characters");
        }

        if (newPassword !== confirmPassword) {
            return setError("Passwords do not match");
        }

        try {
            setLoading(true);

            const res = await fetch(
                `http://localhost:5000/api/users/reset-password/${token}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ newPassword }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message);
            }

            alert("Password reset successful. Please login.");
            navigate("/login");

        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">

            <div className="w-full max-w-md bg-black/50 border border-green-500/30 rounded-2xl p-8 flex flex-col gap-5">

                {error && (
                    <div className="bg-red-500/20 text-red-400 text-sm px-4 py-2 rounded-lg text-center">
                        {error}
                    </div>
                )}

                <div className="text-center">
                    <img
                        src={fingerprint}
                        alt="Fingerprint"
                        className="w-16 mx-auto mb-3"
                    />

                    <h1 className="text-green-400 text-2xl font-bold">
                        Reset Password
                    </h1>

                    <p className="text-green-300/60 text-sm mt-2">
                        Create a new secure password for your account.
                    </p>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleReset}
                    className="flex flex-col gap-4"
                >

                    <input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="
                            bg-black/30
                            border border-green-500/30
                            text-green-100
                            placeholder-green-700
                            rounded-lg
                            px-4
                            py-3
                            focus:outline-none
                            focus:ring-1
                            focus:ring-green-500
                        "
                    />

                    <input
                        type="password"
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="
                            bg-black/30
                            border border-green-500/30
                            text-green-100
                            placeholder-green-700
                            rounded-lg
                            px-4
                            py-3
                            focus:outline-none
                            focus:ring-1
                            focus:ring-green-500
                        "
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="
                            bg-green-500
                            hover:bg-green-400
                            disabled:opacity-60
                            text-black
                            font-bold
                            py-3
                            rounded-lg
                            transition-colors
                        "
                    >
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>

                </form>

                {/* Back to Login */}
                <div className="text-center">
                    <button
                        onClick={() => navigate("/login")}
                        className="
                            text-green-400
                            hover:text-green-300
                            underline
                            text-sm
                            transition-colors
                        "
                    >
                        Back to Login
                    </button>
                </div>

            </div>

        </div>
    );
}