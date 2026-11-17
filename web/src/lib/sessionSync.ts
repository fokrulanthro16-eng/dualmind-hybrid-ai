'use client';

import {
  collection,
  doc,
  setDoc,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import { getFirebaseClient } from './firebase';
import { SessionData, Turn, NegotiationPlaybook } from './types';

export function generateSessionCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'DM-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function createOrJoinSession(
  sessionCode: string,
  playbook: NegotiationPlaybook,
  escalationThreshold: number
): Promise<string> {
  const { db } = getFirebaseClient();
  const sessionId = `session_${sessionCode.replace('-', '_')}`;

  if (db) {
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      await setDoc(
        sessionRef,
        {
          id: sessionId,
          sessionCode,
          createdAt: Date.now(),
          escalationThreshold,
          playbook,
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('[DualMind] Session sync offline / local fallback:', err);
    }
  }

  return sessionId;
}

export async function pushTurnToFirestore(sessionId: string, turn: Turn): Promise<void> {
  const { db } = getFirebaseClient();
  if (!db) return;

  try {
    const turnsCol = collection(db, 'sessions', sessionId, 'turns');
    await addDoc(turnsCol, {
      ...turn,
      createdAt: Date.now(),
    });
  } catch (err) {
    console.warn('[DualMind] Failed to push turn to Firestore (queued locally):', err);
  }
}

export function subscribeToSessionTurns(
  sessionId: string,
  onUpdate: (turns: Turn[]) => void
): Unsubscribe {
  const { db } = getFirebaseClient();
  if (!db) {
    return () => {};
  }

  try {
    const turnsCol = collection(db, 'sessions', sessionId, 'turns');
    const q = query(turnsCol, orderBy('timestamp', 'asc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const turns: Turn[] = [];
        snapshot.forEach((d) => {
          turns.push({ id: d.id, ...d.data() } as Turn);
        });
        onUpdate(turns);
      },
      (err) => {
        console.warn('[DualMind] Turns subscription note (running offline):', err);
      }
    );
  } catch {
    return () => {};
  }
}
