import { create } from "zustand";
import type { Mission } from "@/lib/nasa";

type Filter = "all" | "active" | "completed" | "planned";

type MissionsStore = {
  missions: Mission[];
  filter: Filter;
  search: string;
  setMissions: (missions: Mission[]) => void;
  setFilter: (filter: Filter) => void;
  setSearch: (search: string) => void;
  filtered: () => Mission[];
};

export const useMissionsStore = create<MissionsStore>((set, get) => ({
  missions: [],
  filter: "all",
  search: "",
  setMissions: (missions) => set({ missions }),
  setFilter: (filter) => set({ filter }),
  setSearch: (search) => set({ search }),
  filtered: () => {
    const { missions, filter, search } = get();
    return missions
      .filter((m) => filter === "all" || m.launch_details.status === filter)
      .filter((m) =>
        search
          ? m.name.toLowerCase().includes(search.toLowerCase()) ||
            m.program.toLowerCase().includes(search.toLowerCase())
          : true
      );
  },
}));
