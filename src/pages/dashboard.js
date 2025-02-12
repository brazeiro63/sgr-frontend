import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Dashboard() {
  const router = useRouter();
  const [requisitos, setRequisitos] = useState([]);
  const [historico, setHistorico] = useState({});
  const [user, setUser] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [editando, setEditando] = useState(null);
  const estadosDisponiveis = ["Proposto", "Aprovado", "Rejeitado", "Implementado", "Em Produção"];

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    fetch("http://127.0.0.1:8000/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch(() => router.push("/login"));

    carregarRequisitos();
  }, [router]);

  const carregarRequisitos = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/requisitos/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Erro ao carregar requisitos");

      const data = await response.json();
      setRequisitos(data);

      // Carregar histórico para cada requisito
      data.forEach((req) => carregarHistorico(req.id));
    } catch (error) {
      console.error("Erro ao buscar requisitos:", error);
    }
  };

  const carregarHistorico = async (requisitoId) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/requisitos/${requisitoId}/historico`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Erro ao carregar histórico");

      const data = await response.json();
      setHistorico((prev) => ({ ...prev, [requisitoId]: data }));
    } catch (error) {
      console.error(`Erro ao buscar histórico para o requisito ${requisitoId}:`, error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/requisitos/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          titulo,
          descricao,
          projeto_id: 1,
        }),
      });

      if (!response.ok) throw new Error("Erro ao criar requisito");

      setTitulo("");
      setDescricao("");
      carregarRequisitos();
    } catch (error) {
      console.error("Erro ao criar requisito:", error);
    }
  };

  const handleChangeEstado = async (requisitoId, novoEstado) => {
    console.log("Enviando estado:", JSON.stringify({ novo_estado: novoEstado.trim() })); // Debug
    
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`http://127.0.0.1:8000/api/requisitos/${requisitoId}/estado`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ novo_estado: novoEstado.trim() }) // Remove espaços extras
        });

        const responseData = await response.json();
        console.log("Resposta da API:", responseData);

        if (!response.ok) throw new Error(`Erro: ${response.status} - ${JSON.stringify(responseData)}`);

        carregarRequisitos();
    } catch (error) {
        console.error("Erro ao atualizar estado:", error);
    }
};


  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900">Bem-vindo, {user?.name || "Usuário"}!</h1>

      {/* Formulário para Criar Requisitos */}
      <div className="bg-gray-100 p-6 mt-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Novo Requisito</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full p-2 border rounded mb-2"
            required
          />
          <textarea
            placeholder="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full p-2 border rounded mb-2"
            required
          ></textarea>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Criar</button>
        </form>
      </div>

      {/* Lista de Requisitos */}
      <h2 className="text-2xl font-semibold mt-6 text-gray-800">Seus Requisitos:</h2>

      {requisitos.length === 0 ? (
        <p className="text-gray-500 mt-4">Nenhum requisito cadastrado.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {requisitos.map((req) => (
            <li key={req.id} className="bg-white shadow p-4 rounded-lg">
              <div>
                <h3 className="text-lg font-bold">{req.titulo}</h3>
                <p className="text-gray-600">{req.descricao}</p>
                <p className="mt-2 text-sm">Estado: <strong>{req.estado}</strong></p>
              </div>

              {/* Alterar Estado */}
              <select
                className="mt-2 p-2 border rounded"
                value={req.estado}
                onChange={(e) => handleChangeEstado(req.id, e.target.value)}
              >
                {estadosDisponiveis.map((estado) => (
                  <option key={estado} value={estado}>{estado}</option>
                ))}
              </select>

              {/* Exibir Histórico */}
              <div className="mt-4">
                <h4 className="text-md font-semibold">Histórico:</h4>
                <ul className="text-sm text-gray-600">
                  {historico[req.id]?.length > 0 ? (
                    historico[req.id].map((h, index) => (
                      <li key={index}>
                        {h.estado_anterior} → {h.estado_novo} ({new Date(h.data_alteracao).toLocaleString()})
                      </li>
                    ))
                  ) : (
                    <li>Nenhuma alteração registrada</li>
                  )}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Logout */}
      <button
        className="mt-6 bg-red-500 text-white px-4 py-2 rounded"
        onClick={() => {
          localStorage.removeItem("token");
          router.push("/login");
        }}
      >
        Sair
      </button>
    </div>
  );
}
