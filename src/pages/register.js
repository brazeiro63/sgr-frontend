import { useState } from "react";
import { useRouter } from "next/router";

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        throw new Error("Falha no registro");
      }

      router.push("/login");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form className="bg-white p-6 rounded-lg shadow-md w-96" onSubmit={handleRegister}>
        <h2 className="text-2xl font-semibold mb-4">Registrar</h2>

        {error && <p className="text-red-500">{error}</p>}

        <input
          type="text"
          placeholder="Nome"
          className="w-full p-2 border rounded mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Senha"
          className="w-full p-2 border rounded mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" className="w-full bg-green-500 text-white p-2 rounded">
          Registrar
        </button>
      </form>
    </div>
  );
}
