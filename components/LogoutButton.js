import { removeFromStorage } from '../helper/localStorage';
import { useRouter } from 'next/router';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    removeFromStorage('player-name');
    removeFromStorage('player-id');
    removeFromStorage('player-record');
    router.push('/signin');
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-600 hover:bg-red-700 text-white font-medium rounded-full px-5 py-2 transition focus:outline-none focus:ring-2 focus:ring-red-400"
    >
      Cerrar sesión
    </button>
  );
} 