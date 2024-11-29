import { io } from 'socket.io-client';
import { REACT_APP_SERVER_URL, REACT_APP_SOCKET_URL } from '../config'

const URL = process.env.NODE_ENV === 'production' ? undefined : REACT_APP_SERVER_URL;

export const socket = io(REACT_APP_SOCKET_URL, {
    path: '',
    transports: ['websocket', 'polling']
});