import '../styles/globals.css'
import LogoutButton from '../components/LogoutButton';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <header className="w-full flex items-center justify-between py-4 bg-transparent border-b border-gray-700 px-4">
        <span className="text-2xl font-bold tracking-widest text-white logo-mdev">MDEV</span>
        <LogoutButton />
      </header>
      <main className="min-h-screen flex flex-col items-center justify-start w-full">
        <Component {...pageProps} />
      </main>
    </>
  )
}

export default MyApp
