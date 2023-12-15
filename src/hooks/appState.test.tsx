import { describe, expect, test, it } from "vitest";
import { act, waitFor } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import { initialConfig, useAppActions, useAppStore } from "@/hooks/appState";
import { flyaway } from "@/lib/icons";

describe("actions", () => {
  describe("config", () => {
    test("default config is loaded", () => {
      const { result } = renderHook(() => useAppActions());
      expect(result.current.getConfig()).toBe(initialConfig);
    });
  });

  describe("updateOrder", () => {
    it("updates order when updateOrder is called", () => {
      const { result } = renderHook(() => useAppActions());
      act(() => {
        result.current.addEditor(flyaway, "title");
      });

      const editorsOld = result.current.getEditors();

      act(() => {
        result.current.updateOrder(editorsOld[1][0], editorsOld[0][0]);
      });

      expect(result.current.getEditors()).toHaveLength(2);
      const editorsNew = result.current.getEditors();

      expect(editorsNew[0][0]).toBe(editorsOld[1][0]);
      expect(editorsNew[1][0]).toBe(editorsOld[0][0]);
    });

    it("ignores order when incorrect id is specified", () => {
      const { result } = renderHook(() => useAppActions());
      act(() => {
        result.current.addEditor(flyaway, "title");
      });

      const editorsOld = result.current.getEditors();

      act(() => {
        result.current.updateOrder(editorsOld[1][0], "not-an-id");
      });

      expect(result.current.getEditors()).toHaveLength(2);
      const editorsNew = result.current.getEditors();

      expect(editorsOld[0][0]).toBe(editorsNew[0][0]);
      expect(editorsOld[1][0]).toBe(editorsNew[1][0]);
    });
  });

  describe("addGroup", () => {
    it("adds a new group", () => {
      const { result } = renderHook(() => useAppStore());

      expect(result.current.groups).toHaveLength(1);

      act(() => {
        result.current.actions.addGroup("Group");
      });

      expect(result.current.groups).toHaveLength(2);
      expect(result.current.groups[1].title).toBe("Group");
    });
  });

  describe("removeGroup", () => {
    it("can remove groups", async () => {
      const { result } = renderHook(() => useAppStore());

      // Setup
      expect(result.current.groups).toHaveLength(1);
      act(() => {
        // Add group for better test coverage
        result.current.actions.addGroup("new group");
      });
      expect(result.current.groups).toHaveLength(2);

      const groupId = result.current.groups[1].id;

      // Set the active group to the group that is then removed
      act(() => {
        result.current.actions.setActiveGroup(result.current.groups[0].id);

        expect(result.current.actions.removeGroup(result.current.groups[0].id))
          .toMatchInlineSnapshot(`
          {
            "hasRemoved": true,
            "hasSwitched": true,
          }
        `);
      });

      // Make sure the group was removed and that the active group returned to the first group
      expect(result.current.groups).toHaveLength(1);
      expect(result.current.groups[0].id).toBe(groupId);
      expect(result.current.activeGroupId).toBe(groupId);
    });

    it("does not allow less than a single group", async () => {
      const { result } = renderHook(() => useAppStore());

      expect(result.current.groups).toHaveLength(1);

      expect(result.current.actions.removeGroup(result.current.groups[0].id))
        .toMatchInlineSnapshot(`
          {
            "hasRemoved": false,
            "hasSwitched": false,
          }
        `);

      expect(result.current.groups).toHaveLength(1);

      // Assert user can't have less than a single group
      // expect(result.current.groups.length).toBe(1);
      // act(() => {
      //   result.current.actions.removeGroup(result.current.activeGroupId);
      // });
      // expect(result.current.groups.length).toBe(1);
    });
  });

  describe("addGroup", () => {
    it("can add groups", async () => {
      const { result } = renderHook(() => useAppStore());

      expect(result.current.groups).toHaveLength(1);

      act(() => {
        result.current.actions.addGroup("Group");
      });

      expect(result.current.groups).toHaveLength(2);
      expect(result.current.groups[1].title).toBe("Group");
    });
  });

  describe("updateGroupTitle", () => {
    it("can update group title", async () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        // Add group for better test coverage
        result.current.actions.addGroup();
      });

      act(() => {
        result.current.actions.updateGroupTitle(
          result.current.groups[0].id,
          "new title"
        );
      });

      expect(result.current.groups[0].title).toBe("new title");
    });
  });

  describe("setActiveGroup", () => {
    it("can set active group", async () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.actions.addGroup();
        result.current.actions.addGroup();
      });

      act(() => {
        expect(
          result.current.actions.setActiveGroup(result.current.groups[1].id)
        ).toMatchInlineSnapshot(`
          {
            "hasSwitched": true,
          }
        `);
      });

      expect(result.current.activeGroupId).toBe(result.current.groups[1].id);
    });

    it("avoids setting to the same group", async () => {
      const { result } = renderHook(() => useAppStore());

      expect(result.current.groups).toHaveLength(1);
      const groupId = result.current.groups[0].id;

      let cb = {};
      act(() => {
        cb = result.current.actions.setActiveGroup(
          result.current.activeGroupId
        );
      });

      expect(result.current.activeGroupId).toBe(groupId);
      expect(cb).toMatchInlineSnapshot(`
        {
          "hasSwitched": false,
        }
      `);
    });
  });

  describe("updateEditorTitle", () => {
    it("updates editor title", async () => {
      const { result } = renderHook(() => useAppActions());

      act(() => {
        // Add items for better test coverage
        result.current.addGroup();
        result.current.addEditor(flyaway, "new editor");
      });

      await waitFor(() => {
        expect(result.current.getEditors()).toHaveLength(2);
      });

      const editor = result.current.getEditors()[1];
      expect(editor[1].title).toBe("new editor");

      act(() => {
        result.current.updateEditorTitle(editor[0], "newy");
      });

      expect(result.current.getEditors()[1][1].title).toBe("newy");
    });
  });

  describe("removeEditor", () => {
    it("removes editor", async () => {
      const { result } = renderHook(() => useAppActions());

      act(() => {
        // Add items for better test coverage
        result.current.addGroup();
        result.current.addEditor("");
      });

      await waitFor(() => {
        expect(result.current.getEditors()).toHaveLength(2);
      });

      act(() => {
        result.current.removeEditor(result.current.getEditors()[1][0]);
      });

      expect(result.current.getEditors()).toHaveLength(1);
    });
  });

  describe("setConfig", () => {
    it("sets a config item", () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.actions.setConfig({ stroke: "red" });
      });

      expect(result.current.actions.getConfig().stroke).toBe("red");
    });

    it("ignores when the activeGroupId isn't found", () => {
      const { result } = renderHook(() => useAppStore());

      const strokeConfigBefore = result.current.actions.getConfig().stroke;

      act(() => {
        result.current.actions.setActiveGroup("not-a-group-id");
        result.current.actions.setConfig({ stroke: "this won't be set" });
      });

      expect(result.current.actions.getConfig().stroke).toEqual(
        strokeConfigBefore
      );
    });

    describe("addEditor", () => {
      it("adds an editor", () => {
        const { result } = renderHook(() => useAppStore());

        // Remove the default group
        expect(result.current.actions.getEditors()).toHaveLength(1);
        act(() => {
          // TODO: Replace with a function that clears all editors
          result.current.actions.removeEditor(
            result.current.actions.getEditors()[0][0]
          );
        });
        expect(result.current.actions.getEditors()).toHaveLength(0);

        // Add an editor
        act(() => {
          result.current.actions.addEditor(flyaway, "title");
        });
        expect(result.current.actions.getEditors()).toHaveLength(1);
        expect(result.current.actions.getEditors()[0][1].title).toBe("title");
        expect(result.current.groups.length).toBe(1);
      });
    });
  });
});
