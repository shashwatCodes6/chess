import { io } from 'socket.io-client';
import {REACT_APP_SERVER_URL} from '../config'

const URL = process.env.NODE_ENV === 'production' ? undefined : REACT_APP_SERVER_URL;

export const socket = io(URL);