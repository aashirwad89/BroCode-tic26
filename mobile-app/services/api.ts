// src/services/api.ts
import axios from 'axios';

const BASE_URL = 'https://brocode-tic26.onrender.com/api';

const api = axios.create({ baseURL: BASE_URL, timeout: 10000 });

// ── Types ─────────────────────────────────────────────────────
export interface Contact {
  _id: string;
  name: string;
  phone: string;
}

export interface SOSTriggerResponse {
  logId: string;
  contacts: { name: string; phone: string }[];
}

// ── Contact APIs ──────────────────────────────────────────────
// ✅ Backend app.js mein: /api/trustedContacts — sab yahi use karo
export const fetchContacts = () =>
  api.get<{ success: boolean; data: Contact[] }>('/trustedContacts');

export const fetchContactById = (id: string) =>
  api.get<{ success: boolean; data: Contact }>(`/trustedContacts/${id}`);

export const addContact = (name: string, phone: string) =>
  api.post<{ success: boolean; message: string; data: Contact }>(
    '/trustedContacts',
    { name, phone }
  );

export const updateContact = (id: string, name: string, phone: string) =>
  api.put<{ success: boolean; message: string; data: Contact }>(
    `/trustedContacts/${id}`,
    { name, phone }
  );

export const deleteContact = (id: string) =>
  api.delete<{ success: boolean; message: string; data: Contact }>(
    `/trustedContacts/${id}`
  );

// ── SOS APIs ──────────────────────────────────────────────────
export const triggerSOS = (latitude: number, longitude: number, audioPath?: string) =>
  api.post<{ success: boolean; data: SOSTriggerResponse }>('/sos/trigger', {
    latitude,
    longitude,
    audioPath,
  });