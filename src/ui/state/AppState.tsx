/**
 * Top-level application state: which view is active, what's in localStorage,
 * which character is selected. Uses useReducer + context — no external state
 * library.
 *
 * The CharacterStore is injectable via props on the provider so tests can
 * substitute a MemoryBackend-backed store.
 */

import { createContext, useContext, useMemo, useReducer, type JSX, type ReactNode } from "react";
import type { CharacterIndexEntry, CharacterStore } from "../../engine/persistence";
import type { Character } from "../../engine/types";

export type View =
  | { kind: "list" }
  | { kind: "sheet"; id: string }
  | { kind: "editor"; id: string };

interface AppState {
  view: View;
  // Latest snapshot of the index. Recomputed after any store mutation.
  index: CharacterIndexEntry[];
  // Most recent transient error message (e.g. import failure). Cleared on
  // explicit dismissal or any successful action.
  error: string | null;
}

type Action =
  | { kind: "navigate"; view: View }
  | { kind: "refreshIndex"; index: CharacterIndexEntry[] }
  | { kind: "setError"; message: string | null };

function reducer(state: AppState, action: Action): AppState {
  switch (action.kind) {
    case "navigate":
      return { ...state, view: action.view, error: null };
    case "refreshIndex":
      return { ...state, index: action.index };
    case "setError":
      return { ...state, error: action.message };
  }
}

export interface AppContextValue {
  state: AppState;
  store: CharacterStore;
  // High-level operations that mutate the store and refresh the index.
  saveCharacter: (c: Character) => void;
  deleteCharacter: (id: string) => void;
  openCharacter: (id: string) => void;
  openEditor: (id: string) => void;
  goHome: () => void;
  setError: (message: string | null) => void;
  refresh: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp called outside AppProvider");
  return ctx;
}

interface AppProviderProps {
  store: CharacterStore;
  children: ReactNode;
}

export function AppProvider({ store, children }: AppProviderProps): JSX.Element {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    view: { kind: "list" } as View,
    index: store.list(),
    error: null,
  }));

  const value = useMemo<AppContextValue>(() => {
    const refresh = () => dispatch({ kind: "refreshIndex", index: store.list() });
    return {
      state,
      store,
      saveCharacter: (c) => {
        store.save(c);
        refresh();
      },
      deleteCharacter: (id) => {
        store.delete(id);
        refresh();
        if (state.view.kind !== "list" && state.view.id === id) {
          dispatch({ kind: "navigate", view: { kind: "list" } });
        }
      },
      openCharacter: (id) => dispatch({ kind: "navigate", view: { kind: "sheet", id } }),
      openEditor: (id) => dispatch({ kind: "navigate", view: { kind: "editor", id } }),
      goHome: () => dispatch({ kind: "navigate", view: { kind: "list" } }),
      setError: (m) => dispatch({ kind: "setError", message: m }),
      refresh,
    };
  }, [state, store]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
