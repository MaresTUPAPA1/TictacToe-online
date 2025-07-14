import { useState, useEffect } from 'react';

export default function GameStartIntroModal(props) {
    const [open, setOpen] = useState(false);
    const [countdown, setCoutdown] = useState(5);

    useEffect(() => {
        let myInterval = null;

        setOpen(props.open);

        if (open) {
            myInterval = setInterval(() => {
                if (countdown > 0) {
                    setCoutdown(countdown - 1);
                }
            }, 1000);
        } else {
            setCoutdown(5);
        }
        return () => clearInterval(myInterval);
    }, [countdown, props, open]);

    return (
        <>
            {open &&
                (
                    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm transition-opacity">
                        <div className="text-6xl font-bold text-white animate-pulse bg-gray-900 bg-opacity-80 rounded-full px-10 py-8 shadow-lg">
                            {countdown}
                        </div>
                    </div>
                )
            }
        </>
    )
}
