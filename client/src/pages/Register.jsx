import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await register(name, email, password);
    if (success) navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-semibold mb-1" style={{ color: "var(--color-ink)" }}>
          Create your account
        </h1>
        <p className="text-sm text-neutral-500 mb-8">Takes less than a minute.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-[var(--color-line)] rounded-md px-3 py-2 focus:outline-none focus:ring-2"
              style={{ "--tw-ring-color": "var(--color-clay)" }}
            />
          </div>

          <div>
            <label className="block text-sm mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[var(--color-line)] rounded-md px-3 py-2 focus:outline-none focus:ring-2"
              style={{ "--tw-ring-color": "var(--color-clay)" }}
            />
          </div>

          <div>
            <label className="block text-sm mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[var(--color-line)] rounded-md px-3 py-2 focus:outline-none focus:ring-2"
              style={{ "--tw-ring-color": "var(--color-clay)" }}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md py-2 text-white font-medium disabled:opacity-60"
            style={{ backgroundColor: "var(--color-clay)" }}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-sm text-neutral-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="underline" style={{ color: "var(--color-clay)" }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}