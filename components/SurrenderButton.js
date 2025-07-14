import { useRouter } from 'next/router';

export default function SurrenderButton({ socket, myRoom, symbol, onSurrender }) {
  const router = useRouter();

  const handleSurrender = () => {
    if (socket && myRoom && symbol) {
      socket.emit('surrender', { room: myRoom, loser: symbol });
      if (onSurrender) onSurrender();
      // Opcional: redirigir o limpiar estado desde el padre
    }
  };

  return (
    <button
      onClick={handleSurrender}
      className="bg-red-600 hover:bg-red-700 text-white font-medium rounded-full px-5 py-2 transition focus:outline-none focus:ring-2 focus:ring-red-400"
    >
      Abandonar partida
    </button>
  );
} 