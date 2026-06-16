import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import fingerprint from "../assets/fingerprint.png";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch(
                "http://localhost:5000/api/users/forgot-password",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            alert("Password reset link sent to your email.");
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

                {/* Logo */}
                <div className="text-center">
                    <img
                        src={fingerprint}
                        alt="Fingerprint"
                        className="w-16 mx-auto mb-3"
                    />

                    <h1 className="text-green-400 text-2xl font-bold">
                        Forgot Password
                    </h1>

                    <p className="text-green-300/60 text-sm mt-2">
                        Enter your registered email address and we'll send you
                        a password reset link.
                    </p>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4"
                >
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                        {loading ? "Sending Link..." : "Send Reset Link"}
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