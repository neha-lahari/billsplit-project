import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import fingerprint from "../assets/fingerprint.png";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMsg("");

        try {
            const res = await fetch("http://localhost:5000/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Login failed");

            localStorage.clear();
            localStorage.setItem("token", data.token);
            localStorage.setItem("username", data.user.username);
            localStorage.setItem("userId", data.user._id);

            navigate("/dashboard/groups");

        } catch (err) {
            setErrorMsg(err.message);
            setTimeout(() => setErrorMsg(""), 6000);
        }
    };

    const handleGoogleLogin = () => {

        const googleWindow = window.open(
            "http://localhost:5000/api/auth/google/login",
            "_blank",
            "width=500,height=600"
        );

        const handleMessage = (event) => {

            if (event.origin !== "http://localhost:5000") return;

            if (event.data.error) {
                setErrorMsg(event.data.error);
            } else if (event.data.token) {
                localStorage.setItem("token", event.data.token);
                localStorage.setItem("username", event.data.user.username);
                localStorage.setItem("userId", event.data.user._id);

                navigate("/dashboard/groups");
            }

            window.removeEventListener("message", handleMessage);
            googleWindow.close();
        };

        window.addEventListener("message", handleMessage);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
            <div className="w-full max-w-md bg-black/50 border border-green-500/30 rounded-2xl p-8 flex flex-col gap-5">

                {errorMsg && (
                    <div className="bg-red-500/20 text-red-400 text-sm px-4 py-2 rounded-lg text-center">
                        {errorMsg}
                    </div>
                )}

                <div className="text-center">
                    <img
                        src={fingerprint}
                        alt="Fingerprint"
                        className="w-16 mx-auto mb-3"
                    />
                    <h1 className="text-green-400 text-2xl font-bold">
                        BillSplit
                    </h1>
                    <p className="text-green-300/60 text-sm mt-1">
                        Welcome back! Login to continue
                    </p>
                </div>

                <form onSubmit={handleLogin} className="flex flex-col gap-3">

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-black/30 border border-green-500/30 text-green-100 placeholder-green-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-green-500"
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-black/30 border border-green-500/30 text-green-100 placeholder-green-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-green-500"
                        required
                    />

                    {/* Forgot Password Link */}
                    <div className="text-right">
                        <span
                            className="text-green-400 text-sm cursor-pointer hover:underline"
                            onClick={() => navigate("/forgot-password")}
                        >
                            Forgot Password?
                        </span>
                    </div>

                    <button
                        type="submit"
                        className="bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-lg mt-1 transition-colors"
                    >
                        Login
                    </button>

                </form>

                <div className="flex items-center gap-3 text-green-800 text-xs">
                    <div className="flex-1 h-px bg-green-500/20" />
                    or
                    <div className="flex-1 h-px bg-green-500/20" />
                </div>

                <button
                    onClick={handleGoogleLogin}
                    className="border border-green-500/30 text-green-300 py-2.5 rounded-lg text-sm hover:bg-green-500/10 transition-colors"
                >
                    Continue with Google
                </button>

                <p className="text-green-700 text-sm text-center">
                    Don't have an account?{" "}
                    <span
                        className="text-green-400 underline cursor-pointer"
                        onClick={() => navigate("/register")}
                    >
                        Register
                    </span>
                </p>

            </div>
        </div>
    );
}