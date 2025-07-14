import { useState, useEffect } from 'react';
import AnimatePage from '../components/AnimatePage';
import { getFromStorage, setToStorage } from '../helper/localStorage';
import Router from "next/router";
import { v4 as uuidv4 } from 'uuid';

export default function Signin() {

    const [name, setName] = useState('');

    useEffect(() => {
        if (!(typeof getFromStorage('player-name') === 'undefined' ||
            getFromStorage('player-name') === null ||
            getFromStorage('player-name') === '')) {
            Router.push('/');
        }
    }, []);

    const handleSubmit = (event, action = '') => {
        if (event.key === 'Enter' || action === 'click') {
            if (!name.replace(/\s/g, '').length || name === '') {
                alert('Enter your name')
            } else if (name.length >= 12) {
                alert('Your name is longer than 11 characters, Please try again.')
            } else {
                setToStorage('player-name', name);
                setToStorage('player-id', uuidv4());
                const record = {
                    wins: 0,
                    loses: 0,
                    draws: 0,
                    total: 0,
                    winRate: 0
                }
                setToStorage('player-record', JSON.stringify(record))
                Router.push('/');
            }
        }
    }

    return (
        <AnimatePage>
            <div className="min-h-screen flex items-center justify-center bg-transparent font-sans">
                <div className="w-full max-w-md bg-gray-900 bg-opacity-60 rounded-lg shadow p-8 flex flex-col gap-6">
                    <h1 className="text-2xl font-bold text-white text-center mb-2">Bienvenido</h1>
                    <p className="text-gray-400 text-center mb-4">Ingresa tu nombre para comenzar a jugar</p>
                    <input
                        type="text"
                        className="w-full px-4 py-2 rounded bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
                        placeholder="Tu nombre..."
                        maxLength={12}
                        onKeyPress={e => handleSubmit(e)}
                        onChange={e => setName(e.target.value)}
                        value={name}
                    />
                    <button
                        onClick={e => handleSubmit(e, 'click')}
                        className="w-full mt-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-full py-2 transition focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        Entrar
                    </button>
                </div>
            </div>
        </AnimatePage>
    )
}