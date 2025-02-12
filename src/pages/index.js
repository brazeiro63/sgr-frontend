import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        Sistema de Gestão de Requisitos
      </h1>
      <div className="space-x-4">
        <Link href="/login">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded">
            Login
          </button>
        </Link>
        <Link href="/register">
          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded">
            Registrar
          </button>
        </Link>
      </div>
    </div>
  );
}
