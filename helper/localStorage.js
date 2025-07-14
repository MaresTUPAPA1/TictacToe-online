export const getFromStorage = (key) => {
    if (typeof window !== 'undefined') {
        return window.localStorage.getItem(key);
    }
}


export const setToStorage = (key, value) => {
    if (typeof window !== 'undefined') {
        return window.localStorage.setItem(key, value);
    }
}

export const removeFromStorage = (key) => {
    if (typeof window !== 'undefined') {
        return window.localStorage.removeItem(key);
    }
}