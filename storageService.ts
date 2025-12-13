import { HealthRiskProfile, Message, Reminder, ViewState } from "../types";

const USERS_KEY = 'medico_users';
const CURRENT_USER_KEY = 'medico_current_user';
const DATA_PREFIX = 'medico_data_';

export const storageService = {
  // --- Auth ---
  getCurrentUser: (): string | null => {
    return localStorage.getItem(CURRENT_USER_KEY);
  },

  setCurrentUser: (email: string | null) => {
    if (email) {
      localStorage.setItem(CURRENT_USER_KEY, email);
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  },

  registerUser: (email: string): boolean => {
    const users = storageService.getUsers();
    if (users.includes(email)) return false;
    
    users.push(email);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Initialize data structure
    storageService.saveUserData(email, {
      chats: {
        [ViewState.CHAT]: [],
        [ViewState.MEDICINE]: [],
        [ViewState.REMEDY]: []
      },
      riskProfile: null,
      reminders: []
    });
    return true;
  },

  verifyUser: (email: string): boolean => {
    const users = storageService.getUsers();
    return users.includes(email);
  },

  getUsers: (): string[] => {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  // --- User Data ---
  
  getUserData: (email: string) => {
    const stored = localStorage.getItem(`${DATA_PREFIX}${email}`);
    const defaultData = {
      chats: { 
        [ViewState.CHAT]: [], 
        [ViewState.MEDICINE]: [], 
        [ViewState.REMEDY]: [] 
      },
      riskProfile: null,
      reminders: []
    };

    if (stored) {
       try {
         const data = JSON.parse(stored);
         
         // Helper to hydrate date strings back to Date objects
         const hydrateMessages = (msgs: any[]) => {
            if (!Array.isArray(msgs)) return [];
            return msgs.map(m => ({
                ...m,
                timestamp: new Date(m.timestamp)
            }));
         };

         // Ensure structure exists even if partial data
         const chats = data.chats || {};
         return {
           chats: {
             [ViewState.CHAT]: hydrateMessages(chats[ViewState.CHAT]),
             [ViewState.MEDICINE]: hydrateMessages(chats[ViewState.MEDICINE]),
             [ViewState.REMEDY]: hydrateMessages(chats[ViewState.REMEDY]),
           },
           riskProfile: data.riskProfile || null,
           reminders: Array.isArray(data.reminders) ? data.reminders : []
         };
       } catch (e) {
         console.error("Error parsing user data", e);
         return defaultData;
       }
    }
    return defaultData;
  },

  saveUserData: (email: string, data: any) => {
    localStorage.setItem(`${DATA_PREFIX}${email}`, JSON.stringify(data));
  },

  // Partial updates helpers
  saveChats: (email: string, mode: ViewState, messages: Message[]) => {
    const data = storageService.getUserData(email);
    // getUserData guarantees chats structure, so we don't need to initialize it.
    // We cast to any to allow indexing with the broader ViewState enum.
    if (data.chats) {
        (data.chats as any)[mode] = messages;
    }
    storageService.saveUserData(email, data);
  },

  saveRiskProfile: (email: string, profile: HealthRiskProfile) => {
    const data = storageService.getUserData(email);
    data.riskProfile = profile;
    storageService.saveUserData(email, data);
  },
  
  saveReminders: (email: string, reminders: Reminder[]) => {
    const data = storageService.getUserData(email);
    data.reminders = reminders;
    storageService.saveUserData(email, data);
  },

  getReminders: (email: string): Reminder[] => {
    const data = storageService.getUserData(email);
    return data.reminders || [];
  }
};