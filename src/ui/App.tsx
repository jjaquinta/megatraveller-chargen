import type { JSX } from "react";
import { AppProvider, useApp } from "./state/AppState";
import { CharacterList } from "./screens/CharacterList";
import { CharacterSheet } from "./screens/CharacterSheet";
import { CharacterEditor } from "./screens/CharacterEditor";
import { createBrowserStore } from "../engine/persistence";
import { validateData } from "../data";

// Validate the data registry at startup so typos surface immediately.
validateData();

// One store instance shared across the app lifetime.
const store = createBrowserStore();

function Router(): JSX.Element {
  const { state } = useApp();
  switch (state.view.kind) {
    case "list":
      return <CharacterList />;
    case "sheet":
      return <CharacterSheet id={state.view.id} />;
    case "editor":
      return <CharacterEditor id={state.view.id} />;
  }
}

export function App(): JSX.Element {
  return (
    <AppProvider store={store}>
      <main>
        <Router />
      </main>
    </AppProvider>
  );
}
