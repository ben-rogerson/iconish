import { newId } from "@/utils/newId";
import { type EditorState, type Group } from "@/utils/types";
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

  updateGroupTitle: (groupId: string, title: string) => void;
  getGroup: () => Group | undefined;
  addGroup: (title?: string) => void;
  removeGroup: (id: string) => { hasSwitched: boolean; hasRemoved: boolean };
  getSvgsFromGroupId: (groupId: string) => string;
  setActiveGroup: (id: string) => { hasSwitched: boolean };
  updateSvgOutputs: (config?: Config) => void;

  getEditors: () => EditorState[];
  getEditorById: (editorId: string) => EditorState | undefined;
  getEditorIndexById: (editorId: string) => number | undefined;
  updateEditorTitle: (id: string, title: string) => void;
  updateEditorSvg: (editorId: string, svgCode?: string) => void;
  refreshEditors: () => void;
  setEditorOrderByIds: (editorKeys: string[]) => void;
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

export const initialConfig = {
  strokeWidth: "2",
  stroke: "currentColor",
  fill: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  nonScalingStroke: true,
} as const satisfies Config;

const makeGroup = (config?: Config, title?: string, editors?: EditorState[]) =>
  ({
    id: newId("g"),
    createdAt: Date.now(),
    title: title ?? "",
    config: config ?? initialConfig,
    editors: editors ?? [initialEditorData()],
  } satisfies Group);

const initialEditorData = (svgData?: SVGData, title?: string) => {
  return [
    newId("e"),
    {
      title: title ?? "",
      svg: {
        output: svgData?.output ?? "",
        original: svgData?.original ?? "",
      },
      view: {
        doc: svgData?.original ?? "",
        selection: null,
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
        activeGroupId: initialGroup.id,
        // activeGroupId: initialGroup.editors[0][0],
        groups: [initialGroup],

        actions: {
          setHydrated() {
            set({ _hasHydrated: true });
          },
          setConfig(configItem) {
            const activeGroupId = get().activeGroupId;

            set({
              groups: produce(get().groups, (draft) => {
                const group = draft.find((g) => g.id === activeGroupId);
                if (!group) return;

                group.config = { ...group.config, ...configItem };
              }),
            });

            get().actions.updateSvgOutputs();
          },

          getConfig() {
            const group = get().actions.getGroup();
            if (!group?.config) return initialConfig;
            return group.config;
          },

          // Groups

          addGroup(title) {
            const config = get().actions.getConfig();
            const newGroup = makeGroup(config, title);
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
            const groups = get().groups;
            if (groups.length <= 1)
              return {
                hasSwitched: false,
                hasRemoved: false,
              };

            const newGroups = groups.filter((g) => g.id !== id);
            set({ groups: newGroups });

            if (get().activeGroupId === id) {
              const { hasSwitched } = get().actions.setActiveGroup(
                newGroups[0]?.id
              );
              return { hasSwitched, hasRemoved: true };
            }

            return {
              hasSwitched: false,
              hasRemoved: newGroups.length < groups.length,
            };
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
                        editorData.title,
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

          updateGroupTitle(groupId, title) {
            set({
              groups: get().groups.map((group) =>
                groupId !== group.id ? group : { ...group, title: title.trim() }
              ),
            });
          },

          refreshEditors: () => {
            set({ updateListHash: hashCode(newId()) });
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
            const svgs = (
              get().groups.find((g) => g.id === groupId)?.editors ?? []
            )
              .map(([, data]) =>
                data.svg.output.startsWith("<svg") ? data.svg.output : null
              )
              .filter(Boolean)
              .join("\n");
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

            const isSvg = input.includes("<svg");

            const newEditor = isSvg
              ? initialEditorData(
                  {
                    ...transformSvg(
                      input,
                      title ?? "",
                      get().actions.getConfig()
                    ),
                    original: input,
                  },
                  title
                )
              : initialEditorData(undefined, input);
            const newEditorId = newEditor[0]; // Get id for scroll use

            // TODO: Rewrite this to use immer
            const newGroups: Group[] = [];

            // if (get().groups.length === 0) {
            //   // get current editors
            //   const editors = get().actions.getEditors();
            //   console.log({ editors });

            //   const newGroup = makeGroup(
            //     get().actions.getConfig(),
            //     undefined,
            //     editors
            //   );
            //   newGroups.push(newGroup);

            //   get().actions.setActiveGroup(newGroup.id);

            //   set({ groups: newGroups });
            //   get().actions.refreshEditors();

            //   return {
            //     scrollTo: () => {},
            //   };
            // }

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
                    .querySelector(`#${newEditorId}`)
                    ?.scrollIntoView({ behavior: "smooth" });
                }, 0);
              },
            };
          },

          addEditorAtIndex: (index, editor) => {
            const newEditor = editor ?? initialEditorData();
            const newEditorId = newEditor[0]; // Get id for scroll use

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
                    .querySelector(`#${newEditorId}`)
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

          setEditorOrderByIds(editorKeys) {
            const activeGroupId = get().activeGroupId;

            const sortEditorsByEditorKeys = (
              a: EditorState,
              b: EditorState
            ) => {
              const x = editorKeys.indexOf(a[0]);
              const y = editorKeys.indexOf(b[0]);
              if (x > y) return 1;
              if (x < y) return -1;
              return 0;
            };

            const groups = get().groups.map((group) => {
              if (activeGroupId !== group.id) return group;

              const resorted = group.editors
                .slice()
                .sort(sortEditorsByEditorKeys);
              // console.log({
              //   origOrder: group.editors.map((e) => e[0]),
              //   resorted: resorted.map((e) => e[0]),
              // });

              const newGroup = { ...group, editors: resorted };
              return newGroup;
            });

            set({ groups });
            setTimeout(() => {
              get().actions.refreshEditors();
            }, 0);
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
        partialize: ({ actions: _, ...rest }) => rest,
        onRehydrateStorage: () => (state) => {
          state?.actions.setHydrated();
        },
        // storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
      }
    )
  )
);
