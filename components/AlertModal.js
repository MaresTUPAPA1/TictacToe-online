import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XIcon } from '@heroicons/react/outline';
import { EmojiSadIcon } from '@heroicons/react/outline';

export default function AlertModal(props) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setOpen(props.open);
    }, [props, open]);


    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" onClose={setOpen}>
                <div className="flex items-center justify-center min-h-screen px-4 text-center">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-100"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-100"
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
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                    <EmojiSadIcon className="h-7 w-7 text-red-400" aria-hidden="true" />
                                </div>
                                <Dialog.Title as="h3" className="text-lg font-semibold text-white mt-2 text-center">
                                    ¡Tu oponente abandonó la partida!
                                </Dialog.Title>
                            </div>
                            <button
                                type="button"
                                className="mt-6 w-full bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-full py-2 transition focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center justify-center gap-2"
                                onClick={() => { props.clickExit() }}>
                                <XIcon className="h-6 w-6 text-white" aria-hidden="true" />
                                Salir
                            </button>
                        </div>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition.Root>
    )
}
