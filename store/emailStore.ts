import { create } from 'zustand';
import { IEmail } from '@/lib/types';

interface EmailStore {
  emails: IEmail[];
  setEmails: (emails: IEmail[]) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageTokenArray: string[];
  setPageTokenArray: (tokens: string[]) => void;
}

export const useEmailStore = create<EmailStore>((set) => ({
  emails: [],
  setEmails: (emails) => set({ emails }),
  currentPage: 0,
  setCurrentPage: (page) => set({ currentPage: page }),
  pageTokenArray: [""],
  setPageTokenArray: (tokens) => set({ pageTokenArray: tokens }),
}));