import { Fragment, useRef, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FlagIcon } from '@heroicons/react/outline';
import { EmojiHappyIcon } from '@heroicons/react/outline';
import { EmojiSadIcon } from '@heroicons/react/outline';
import { XIcon } from '@heroicons/react/outline';
import { RefreshIcon } from '@heroicons/react/outline';
import { v4 as uuidv4 } from 'uuid';

export default function GameResultModal(props) {
    const [open, setOpen] = useState(false);
    const [win, setWin] = useState(null);
    const [modalMsg, setModalMsg] = useState('');
    const [modalDesc, setModalDesc] = useState('');
    const MODAl_DESC = 'If you wish to have a rematch, please click <b>Play Again</b>.';
    const isDisable = useRef(false);

    useEffect(() => {
        setWin(props.win);
        setOpen(props.open);
        if (props.win != null) {
            setModalMsg(props.win ? 'You Win!' : 'You Lose!')
            setOpen(props.open);
            setModalDesc(props.modalDesc ? props.modalDesc : MODAl_DESC);
        } else if (props.open && props.win === null) {
            setModalMsg('Draw!');
            setOpen(props.open);
            setModalDesc(props.modalDesc ? props.modalDesc : MODAl_DESC);
        }
    }, [props]);



    const playAgain = () => {
        if (!isDisable.current) {
            props.clickPlayAgain();
            isDisable.current = true;

            setTimeout(() => {
                isDisable.current = false
            }, 1000);
        } else {
            console.log(isDisable.current);
        }
    }

    const exit = () => {
        if (!isDisable.current) {
            props.clickExit();
            isDisable.current = true;

            setTimeout(() => {
                isDisable.current = false
            }, 1000);
        } else {
            console.log(isDisable.current);
        }
    }

    const RenderEmoji = () => {
        const comp = [];
        if (win === true) {
            comp.push(
                <div key={uuidv4()} className="mx-auto bg-opacity-20 flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10 md:mx-0 md:h-10 md:w-10 lg:mx-0 lg:h-10 lg:w-10">
                    <EmojiHappyIcon className="h-6 w-6 text-green-300" aria-hidden="true" />
                </div>);
            return comp;
        } else if (win === false) {
            comp.push(
                <div key={uuidv4()} className="mx-auto bg-opacity-20 flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10 md:mx-0 md:h-10 md:w-10 lg:mx-0 lg:h-10 lg:w-10">
                    <EmojiSadIcon className="h-6 w-6 text-red-300" aria-hidden="true" />
                </div>);
            return comp;
        } else if (open && win === null) {
            comp.push(
                <div key={uuidv4()} className="mx-auto bg-opacity-20 flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10 md:mx-0 md:h-10 md:w-10 lg:mx-0 lg:h-10 lg:w-10">
                    <FlagIcon className="h-6 w-6 text-blue-300" aria-hidden="true" />
                </div>);
            return comp;
        } else {
            comp.push(
                <div key={uuidv4()} className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-transparent sm:mx-0 sm:h-10 sm:w-10">
                </div>);
            return comp;
        }

    }

    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" onClose={() => { }}>
                <div className="flex items-center justify-center min-h-screen px-4 text-center">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-in duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-out duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-40 transition-opacity" />
                    </Transition.Child>
                    <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                        &#8203;
                    </span>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-100"
                        enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        enterTo="opacity-100 translate-y-0 sm:scale-100"
                        leave="ease-in duration-100"
                        leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                        leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    >
                        <div className="w-full max-w-sm mx-auto bg-gray-900 bg-opacity-90 rounded-lg shadow-xl p-6 flex flex-col items-center">
                            <div className="flex flex-col items-center gap-2 mb-4">
                                <RenderEmoji />
                                <Dialog.Title as="h3" className="text-2xl font-bold text-white mt-2 text-center">
                                    {modalMsg === 'You Win!' ? '¡Ganaste!' : modalMsg === 'You Lose!' ? 'Perdiste' : '¡Empate!'}
                                </Dialog.Title>
                            </div>
                            <div className="flex gap-2 w-full mt-2">
                                <button
                                    type="button"
                                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-full py-2 transition focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center justify-center gap-2"
                                    title='Jugar de nuevo'
                                    onClick={() => playAgain()}>
                                    <RefreshIcon className="h-6 w-6 text-white" aria-hidden="true" />
                                    Jugar de nuevo
                                </button>
                                <button
                                    type="button"
                                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-full py-2 transition focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center justify-center gap-2"
                                    title='Salir'
                                    onClick={() => exit()}>
                                    <XIcon className="h-6 w-6 text-white" aria-hidden="true" />
                                    Salir
                                </button>
                            </div>
                        </div>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition.Root>
    )
}
