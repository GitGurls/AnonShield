import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (identityHash) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!identityHash) return;
    socketRef.current = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');
    socketRef.current.emit('subscribe:threats', identityHash);

    return () => socketRef.current?.disconnect();
  }, [identityHash]);

  return socketRef.current;
};
