import { create } from 'zustand';

interface UiState {
    isSidebarCollapsed: boolean;
    activeModal: string | null;
    toggleSidebar: () => void;
    openModal: (modalName: string) => void;
    closeModal: () => void;
}

export const useUiStore = create<UiState>((set) => ({
    isSidebarCollapsed: false,
    activeModal: null,

    toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

    openModal: (modalName) => set({ activeModal: modalName }),

    closeModal: () => set({ activeModal: null }),
}));
