import {atomFamily, atoms, selector, selectorFamily} from 'recoil';

export const game = atomFamily({
    key: 'gameDetails',
    get: (roomID) => async ({get}) => {
        
        const data = await response.json();
        return data;
    },
    set: (roomID) => ({set}, newValue) => {
        set(atoms[roomID], newValue);
    },
});