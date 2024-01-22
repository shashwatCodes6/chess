import {atoms, selector, selectorFamily} from 'recoil';

export const game = selectorFamily({
    key: 'game',
    get: (roomID) => async ({get}) => {
        const response = await fetch(`http://localhost:3000/game/${roomID}`);
        const data = await response.json();
        return data;
    },
    set: (roomID) => ({set}, newValue) => {
        set(atoms[roomID], newValue);
    },
});