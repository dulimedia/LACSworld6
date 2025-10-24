import { create } from 'zustand';

export type TabKey = 'explore' | 'request';
export type ViewKey = 'explore' | 'request' | 'details';

interface SidebarState {
  open: boolean;
  tab: TabKey;
  view: ViewKey;
  floorPlanExpanded: boolean;
  setOpen: (open: boolean) => void;
  setTab: (tab: TabKey) => void;
  setView: (view: ViewKey) => void;
  setFloorPlanExpanded: (expanded: boolean) => void;
}

export const useSidebarState = create<SidebarState>((set) => ({
  open: true,
  tab: 'explore',
  view: 'explore',
  floorPlanExpanded: false,
  setOpen: (open) => set({ open }),
  setTab: (tab) => set({ tab }),
  setView: (view) => set({ view }),
  setFloorPlanExpanded: (expanded) => set({ floorPlanExpanded: expanded }),
}));
