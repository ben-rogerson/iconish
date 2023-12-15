// import { expect, describe, it } from "vitest";
// import { render, waitFor, screen, renderHook } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
// import { Sortable } from "./Sortable";
// import { useAppActions } from "@/hooks/appState";
// import { useAppStore } from "@/hooks/appState";

// describe("<Sortable />", () => {
// it("adds new editors at top when using the top + button", async () => {
//   render(<Sortable />);
//   const { result } = renderHook(() => useAppActions());
//   const editors = result.current.getEditors();
//   const editor1Id = editors[0][0];
//   expect(editors).toHaveLength(1);
//   const addButton = screen.getAllByTestId("add-editor-button")[0];
//   userEvent.click(addButton);
//   await waitFor(() => {
//     const newEditors = result.current.getEditors();
//     expect(newEditors).toHaveLength(2);
//     expect(newEditors[0][0]).not.toBe(editor1Id);
//     expect(newEditors[1][0]).toBe(editor1Id);
//   });
// });
// it("adds new editors at bottom when using the bottom + button", async () => {
//   render(<Sortable />);
//   const { result } = renderHook(() => useAppActions());
//   const editors = result.current.getEditors();
//   const editor1Id = editors[0][0];
//   expect(editors).toHaveLength(1);
//   const addButton = screen.getAllByTestId("add-editor-button")[1];
//   userEvent.click(addButton);
//   await waitFor(() => {
//     const newEditors = result.current.getEditors();
//     expect(newEditors).toHaveLength(2);
//     expect(newEditors[0][0]).toBe(editor1Id);
//     expect(newEditors[1][0]).not.toBe(editor1Id);
//   });
// });
// Untested below ===
// skip("adds a new editor below an existing editor when the bottom add button is clicked", async () => {
//   render(<Sortable />);
//   const addButton = screen.getAllByText("+")[1]; // Assuming the second button is for adding below
//   MouseEvent.click(addButton);
//   // Wait for the UI to update
//   await waitFor(() => {
//     // Assuming the new editor is added below the second existing editor
//     expect(screen.getAllByTestId("sortable-item")[1]).toHaveTextContent(
//       "New Editor"
//     );
//   });
// });
// skip("reorders editors when dragged and dropped", async () => {
//   render(<Sortable />);
//   const initialEditorOrder = screen
//     .getAllByTestId("sortable-item")
//     .map((editor) => editor.textContent);
//   // Drag and drop simulation (you may need to adjust this based on your actual UI)
//   userEvent.drag(screen.getAllByTestId("sortable-item")[0]);
//   userEvent.drop(screen.getAllByTestId("sortable-item")[2]);
//   // Wait for the UI to update
//   await waitFor(() => {
//     const updatedEditorOrder = screen
//       .getAllByTestId("sortable-item")
//       .map((editor) => editor.textContent);
//     // Assuming the editors are reordered as expected
//     expect(updatedEditorOrder).toEqual([
//       initialEditorOrder[1],
//       initialEditorOrder[2],
//       initialEditorOrder[0],
//     ]);
//   });
// });
// });
