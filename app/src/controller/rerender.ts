import { updateContentView } from "../components/ContentView";

export function rerenderContentView() {
    updateContentView.value++;
}
