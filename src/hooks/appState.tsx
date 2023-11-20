import { newId } from "@/utils/newId";
import { type EditorState, type Group } from "@/utils/types";
import deepMerge from "ts-deepmerge";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Config } from "../feature/config/types";
import { transformSvg } from "@/feature/svg/transformSvg";
import { subscribeWithSelector } from "zustand/middleware";
import { hashCode } from "@/utils/hash";
import { produce } from "immer";

type ConfigItem = Partial<Config>;
type SVGData = {
  original?: string;
  output: string;
  id?: string;
};

interface AppStoreActions {
  setHydrated: () => void;

  setConfig: (configItem: ConfigItem) => void;
  getConfig: () => Config;

  updateGroupTitle: (title: string, groupId: string) => void;
  getGroup: () => Group | undefined;
  addGroup: () => void;
  removeGroup: (id: string) => void;
  getSvgsFromGroupId: (groupId: string) => string;
  setActiveGroup: (id: string) => { hasSwitched: boolean };
  updateSvgOutputs: (config?: Config) => void;

  getEditors: () => EditorState[];
  getEditorById: (editorId: string) => EditorState | undefined;
  getEditorIndexById: (editorId: string) => number | undefined;
  updateEditorTitle: (id: string, title: string) => void;
  updateEditorSvg: (editorId: string, svgCode?: string) => void;
  refreshEditors: () => void;
  updateOrder: (activeId: string, overId: string) => void;
  removeEditor: (id: string, shouldRefresh?: boolean) => void;
  addEditor: (
    input: string,
    title?: string,
    toGroupId?: string
  ) => { scrollTo: () => void };
  addEditorAtIndex: (
    index: number,
    editor?: EditorState
  ) => { scrollTo: () => void };
}

interface AppStoreState {
  _hasHydrated: boolean;
  updateListHash: number;
  groups: Group[];
  activeGroupId: Group["id"];
}

const initialConfig = {
  strokeWidth: "2",
  stroke: "currentColor",
  fill: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
} satisfies Config;

const makeGroup = (config?: Config) =>
  ({
    id: newId("g"),
    createdAt: Date.now(),
    title: "",
    config: config ?? initialConfig,
    editors: [initialEditorData()],
  } satisfies Group);

const initialEditorData = (svgData?: SVGData, title?: string) => {
  return [
    newId("e"),
    {
      title: title ?? "",
      svg: {
        ...svgData,
        // ...{
        // symbolReference: "",
        // symbol: "",
        output: "",
        original: "",
        // ...svgData?. ?? {}
        // },
      },
      view: {
        doc: svgData?.original ?? "",
        selection: null,
        // history: null,
      },
    },
  ] satisfies EditorState;
};

const initialGroup = makeGroup();

export const useAppActions = () => useAppStore((state) => state.actions);

export const useAppStore = create<
  AppStoreState & { actions: AppStoreActions }
>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        _hasHydrated: false,
        updateListHash: 123,
        activeGroupId: initialGroup.editors[0][0],
        groups: [initialGroup],

        actions: {
          setHydrated() {
            set({ _hasHydrated: true });
          },
          setConfig(configItem) {
            const groupId = get().activeGroupId;
            set({
              groups: produce(get().groups, (draft) => {
                const group = draft.find((group) => group.id === groupId);
                if (!group) return;
                group.config = { ...group.config, ...configItem };
              }),
            });

            get().actions.updateSvgOutputs();
          },

          getConfig() {
            const group = get().actions.getGroup();
            if (!group?.config) return initialConfig;
            return group?.config;
          },

          // Groups

          addGroup() {
            const config = get().actions.getConfig();
            const newGroup = makeGroup(config);
            set({
              groups: [...get().groups, newGroup],
              activeGroupId: newGroup.id,
            });
            get().actions.refreshEditors();
            document
              .querySelector(`#header`)
              ?.scrollIntoView({ behavior: "smooth" });
          },

          removeGroup(id) {
            const newGroups = get().groups.filter((g) => g.id !== id);
            set({ groups: newGroups });
            if (get().activeGroupId === id)
              set({ activeGroupId: newGroups[0]?.id });
          },

          setActiveGroup(activeGroupId) {
            if (get().activeGroupId === activeGroupId)
              return { hasSwitched: false };

            set({ activeGroupId });
            get().actions.refreshEditors();

            return { hasSwitched: true };
          },

          // TODO: run updateSvgOutputs thru this
          updateEditorSvg(editorId, svgCode) {
            const config = get().actions.getConfig();

            const groups = produce(get().groups, (draft) => {
              for (const group of draft) {
                for (const [id, editorData] of group.editors) {
                  if (id !== editorId) continue;

                  const svg = transformSvg(
                    svgCode ?? editorData.svg.original,
                    editorData.title,
                    config
                  );

                  editorData.svg = {
                    ...editorData.svg,
                    ...svg,
                    original: editorData.svg.original || (svgCode ?? ""),
                  } satisfies SVGData;

                  editorData.view = {
                    ...editorData.view,
                    doc: svgCode ?? editorData.view?.doc ?? "",
                  } satisfies EditorState[1]["view"];

                  return;
                }
              }
            }) satisfies Group[];

            set({ groups });
            get().actions.refreshEditors();
          },

          updateSvgOutputs() {
            const activeGroupId = get().activeGroupId;
            const config = get().actions.getConfig();

            // const transformSvg = doTransformSvg(config ?? get().config);
            const groups = get().groups.map((group) =>
              group.id === activeGroupId
                ? {
                    ...group,
                    editors: group.editors.map((editor) => {
                      const editorData = editor[1];
                      const svg = transformSvg(
                        editorData.view?.doc ?? editorData.svg.original,
                        editorData.title ?? "",
                        config
                      );
                      return [
                        editor[0],
                        {
                          ...editorData,
                          svg: {
                            ...editorData.svg,
                            ...svg,
                          },
                        },
                      ] satisfies EditorState;
                    }),
                  }
                : group
            );

            set({ groups });
            get().actions.refreshEditors();
          },

          updateGroupTitle(title, groupId) {
            set({
              groups: get().groups.map((group) =>
                groupId !== group.id ? group : { ...group, title: title.trim() }
              ),
            });
          },

          refreshEditors: () => {
            set({ updateListHash: hashCode(newId()) });
            console.log("refreshEditors");
          },

          getEditors: () => {
            const activeGroupId = get().activeGroupId;
            return (
              get().groups.find((g) => g.id === activeGroupId)?.editors ?? []
            );
          },

          getEditorById: (editorId) =>
            get()
              .actions.getEditors()
              .find((e) => e[0] === editorId),

          getSvgsFromGroupId(groupId: string) {
            const svgs =
              (get().groups.find((g) => g.id === groupId)?.editors ?? [])
                .map(([, data]) =>
                  data.svg.output.startsWith("<svg") ? data.svg.output : null
                )
                .filter(Boolean)
                .join("\n") ?? "";
            return svgs;
          },

          getGroup() {
            const activeGroupId = get().activeGroupId;
            const group = get().groups.find((g) => g.id === activeGroupId);

            // if ((group?.editors.length ?? 0) > 0) {
            //   get().actions.addEditor("", "", activeGroupId);
            // }
            return group;
          },

          addEditor: (input, title, toGroupId) => {
            const groupAddingTo =
              // (toGroupId ?? activeGroupId) === undefined
              // ? addGroup()?.id:
              toGroupId ?? get().activeGroupId;

            const isSvg = input?.includes("<svg");

            const newEditor = isSvg
              ? initialEditorData(
                  transformSvg(input, title ?? "", get().actions.getConfig()),
                  title
                )
              : initialEditorData(undefined, input);
            const newId = newEditor[0]; // Get id for scroll use

            const newGroups: Group[] = [];

            for (const group of get().groups) {
              if (groupAddingTo !== group.id) {
                newGroups.push(group);
                continue;
              }

              // const newEditor = isSvg
              //   ? initialEditorData(code, title)
              //   : initialEditorData("", code);

              newGroups.push({
                ...group,
                editors: [...group.editors, newEditor],
              });

              break;
            }

            set({ groups: newGroups });
            get().actions.refreshEditors();

            return {
              scrollTo: () => {
                setTimeout(() => {
                  document
                    .querySelector(`#${newId}`)
                    ?.scrollIntoView({ behavior: "smooth" });
                }, 0);
              },
            };
          },

          addEditorAtIndex: (index, editor) => {
            const newEditor = editor ?? initialEditorData();
            const newId = newEditor[0]; // Get id for scroll use

            const newGroups: Group[] = [];

            const activeGroupId = get().activeGroupId;

            for (const group of get().groups) {
              if (activeGroupId !== group.id) {
                newGroups.push(group);
                continue;
              }

              const newEditors = [...group.editors];
              newEditors.splice(index, 0, newEditor);

              newGroups.push({ ...group, editors: newEditors });
            }

            set({ groups: newGroups });
            get().actions.refreshEditors();

            return {
              scrollTo: () => {
                setTimeout(() => {
                  document
                    .querySelector(`#${newId}`)
                    ?.scrollIntoView({ behavior: "smooth" });
                }, 0);
              },
            };
          },

          removeEditor: (id, shouldRefresh = true) => {
            const activeGroupId = get().activeGroupId;
            const newGroups = get().groups.map((group) => {
              if (activeGroupId !== group.id) return group;
              const newGroup = {
                ...group,
                editors: group.editors.filter((editor) => editor[0] !== id),
              };
              return newGroup;
            });
            set({ groups: newGroups });

            shouldRefresh && get().actions.refreshEditors();
          },

          getEditorIndexById(editorId) {
            const index = get()
              .actions.getEditors()
              .findIndex((e) => e[0] === editorId);

            if (index < 0) return;
            return index;
          },

          updateOrder(activeId, overId) {
            const index = get().actions.getEditorIndexById(overId);
            if (index === undefined) return;

            const editor = get().actions.getEditorById(activeId);
            get().actions.removeEditor(activeId, false);
            get().actions.addEditorAtIndex(index, editor);
          },

          updateEditorTitle: (id: string, title: string) => {
            const activeGroupId = get().activeGroupId;
            const groups = get().groups.map((group) => {
              if (activeGroupId !== group.id) return group;
              const newGroup = {
                ...group,
                editors: group.editors.map((editor) => {
                  if (editor[0] === id)
                    return [
                      id,
                      { ...editor[1], title: title.toLowerCase().trim() },
                    ] satisfies EditorState;
                  return editor;
                }),
              };
              return newGroup;
            });
            set({ groups });
          },
        },
      }),
      {
        name: "data-storage",
        partialize: ({ actions, ...rest }) => rest,
        onRehydrateStorage: () => (state) => {
          state?.actions.setHydrated();
        },
        // storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
      }
    )
  )
);
