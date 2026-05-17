import { useCallback, useEffect, useRef, useState } from 'react';

const iceServers = [{ urls: 'stun:stun.l.google.com:19302' }];

export function useWebRTCInterview({ interviewId, socketRef, localStream, participants, currentUserId, channel = 'video' }) {
  const peersRef = useRef(new Map());
  const [remoteStreams, setRemoteStreams] = useState({});

  const ensurePeer = useCallback(
    (targetUserId, initiator = false) => {
      if (!targetUserId || targetUserId === currentUserId) return null;
      if (peersRef.current.has(targetUserId)) return peersRef.current.get(targetUserId);

      const peer = new RTCPeerConnection({ iceServers });
      peersRef.current.set(targetUserId, peer);

      localStream?.getTracks().forEach((track) => peer.addTrack(track, localStream));

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current?.emit('video:signal', {
            interviewId,
            targetUserId,
            channel,
            signalType: 'ice-candidate',
            signal: event.candidate.toJSON()
          });
        }
      };

      peer.ontrack = (event) => {
        const [stream] = event.streams;
        setRemoteStreams((current) => ({ ...current, [targetUserId]: stream }));
      };

      peer.onconnectionstatechange = () => {
        if (['failed', 'closed', 'disconnected'].includes(peer.connectionState)) {
          peersRef.current.delete(targetUserId);
          setRemoteStreams((current) => {
            const next = { ...current };
            delete next[targetUserId];
            return next;
          });
        }
      };

      if (initiator) {
        peer
          .createOffer()
          .then((offer) => peer.setLocalDescription(offer))
          .then(() => {
            socketRef.current?.emit('video:signal', {
              interviewId,
              targetUserId,
              channel,
              signalType: 'offer',
              signal: peer.localDescription
            });
          });
      }

      return peer;
    },
    [channel, currentUserId, interviewId, localStream, socketRef]
  );

  useEffect(() => {
    if (!localStream) return;
    participants.forEach((participant) => {
      if (participant.userId !== currentUserId) ensurePeer(participant.userId, true);
    });
  }, [currentUserId, ensurePeer, localStream, participants]);

  useEffect(() => {
    if (!localStream) return;

    peersRef.current.forEach((peer, targetUserId) => {
      localStream.getTracks().forEach((track) => {
        const existingSender = peer.getSenders().find((sender) => sender.track?.kind === track.kind);
        if (existingSender) {
          existingSender.replaceTrack(track);
        } else {
          peer.addTrack(track, localStream);
        }
      });

      peer
        .createOffer()
        .then((offer) => peer.setLocalDescription(offer))
        .then(() => {
          socketRef.current?.emit('video:signal', {
            interviewId,
            targetUserId,
            channel,
            signalType: 'offer',
            signal: peer.localDescription
          });
        });
    });
  }, [channel, interviewId, localStream, socketRef]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return undefined;

    const onOffer = async ({ fromUserId, signal, channel: signalChannel = 'video' }) => {
      if (signalChannel !== channel) return;
      const peer = ensurePeer(fromUserId, false);
      await peer.setRemoteDescription(new RTCSessionDescription(signal));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socket.emit('video:signal', {
        interviewId,
        targetUserId: fromUserId,
        channel,
        signalType: 'answer',
        signal: peer.localDescription
      });
    };

    const onAnswer = async ({ fromUserId, signal, channel: signalChannel = 'video' }) => {
      if (signalChannel !== channel) return;
      const peer = ensurePeer(fromUserId, false);
      await peer.setRemoteDescription(new RTCSessionDescription(signal));
    };

    const onIce = async ({ fromUserId, signal, channel: signalChannel = 'video' }) => {
      if (signalChannel !== channel) return;
      const peer = ensurePeer(fromUserId, false);
      await peer.addIceCandidate(new RTCIceCandidate(signal));
    };

    socket.on('video:offer', onOffer);
    socket.on('video:answer', onAnswer);
    socket.on('video:ice-candidate', onIce);

    return () => {
      socket.off('video:offer', onOffer);
      socket.off('video:answer', onAnswer);
      socket.off('video:ice-candidate', onIce);
    };
  }, [channel, ensurePeer, interviewId, localStream, socketRef]);

  const replaceTracks = useCallback((nextStream) => {
    peersRef.current.forEach((peer) => {
      nextStream.getTracks().forEach((track) => {
        const sender = peer.getSenders().find((item) => item.track?.kind === track.kind);
        if (sender) sender.replaceTrack(track);
      });
    });
  }, []);

  return { remoteStreams, replaceTracks };
}
