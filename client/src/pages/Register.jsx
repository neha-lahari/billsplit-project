import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import fingerprint from "../assets/fingerprint.png";

export default function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setErrorMsg("");

        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/users/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Registration failed");

            localStorage.setItem("token", data.token);
            localStorage.setItem("username", data.user.username);
            localStorage.setItem("userId", data.user._id);

            navigate("/dashboard/groups");

        } catch (err) {
            setErrorMsg(err.message);
            setTimeout(() => setErrorMsg(""), 6000);
        }
    };

    const handleGoogleRegister = () => {

        const googleWindow = window.open(
            `${process.env.REACT_APP_API_URL}/api/auth/google/register`,
            "_blank",
            "width=500,height=600"
        );

        const handleMessage = (event) => {

            if (event.origin !== process.env.REACT_APP_API_URL) return;

            if (event.data.error) {
                setErrorMsg(event.data.error);
            } else if (event.data.token) {
                localStorage.setItem("token", event.data.token);
                localStorage.setItem("username", event.data.user.username);
                localStorage.setItem("userId", event.data.user.id);
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

                {/* logo*/}
                <div className="text-center">
                    <img src={fingerprint} alt="Fingerprint" className="w-16 mx-auto mb-3" />
                    <h1 className="text-green-400 text-2xl font-bold">BillSplit</h1>
                    <p className="text-green-300/60 text-sm mt-1">Manage your expenses with ease</p>
                </div>

                {/* register form */}
                <form onSubmit={handleRegister} className="flex flex-col gap-3">

                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="bg-black/30 border border-green-500/30 text-green-100 placeholder-green-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-green-500"
                        required
                    />

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

                    <button
                        type="submit"
                        className="bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-lg mt-1 transition-colors"
                    >
                        Register
                    </button>

                </form>

                <div className="flex items-center gap-3 text-green-800 text-xs">
                    <div className="flex-1 h-px bg-green-500/20" />
                    or
                    <div className="flex-1 h-px bg-green-500/20" />
                </div>

                {/* google register button */}
                <button
                    onClick={handleGoogleRegister}
                    className="border border-green-500/30 text-green-300 py-2.5 rounded-lg text-sm hover:bg-green-500/10 transition-colors"
                >
                    Continue with Google
                </button>

                {/* redirect to login */}
                <p className="text-green-700 text-sm text-center">
                    Already have an account?{" "}
                    <span
                        className="text-green-400 underline cursor-pointer"
                        onClick={() => navigate("/login")}
                    >
                        Login
                    </span>
                </p>

            </div>
        </div>
    );
}