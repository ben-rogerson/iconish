import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { produce } from 'immer'
import { newId } from '@/utils/newId'
import { type EditorState, type Group } from '@/utils/types'
import { type Config } from '@/feature/config/types'
import { type LogItem, transformSvg } from '@/feature/svg/transformSvg'
import { getSvgType } from '@/feature/svg/getSvgType'
import { subscribeWithSelector } from 'zustand/middleware'
import { hashCode } from '@/utils/hash'
import { initialConfig } from '@/feature/config/initialConfig'
import { parseSvg } from '@/feature/svg/parseSvg'

type ConfigItem = Partial<Config>
type SVGData = {
  original?: string
  output: string
  outputJsx: string
  id?: string
  log: LogItem[]
  savings: number
}

interface AppStoreActions {
  setHydrated: () => void

  setConfig: (configItem: ConfigItem, shouldUpdate?: boolean) => void
  getConfig: () => Config
  resetConfig: () => void

  updateGroupTitle: (groupId: string, title: string) => void
  getGroup: (props?: { withPlaceholders?: boolean }) => Group | undefined
  getGroups: (props?: { withPlaceholders?: boolean }) => Group[]
  addGroup: (title?: string) => void
  removeGroup: (id: string) => { hasSwitched: boolean; hasRemoved: boolean }
  getSvgsFromGroupId: (groupId: string) => string
  getSvgsFromGroupIdForDownload: (groupId: string) => Array<[string, string]>
  setActiveGroup: (id: string) => { hasSwitched: boolean }
  updateSvgOutputs: (config?: Config) => void

  getEditors: (props?: { withPlaceholders?: boolean }) => EditorState[]
  getEditorById: (editorId: string) => EditorState | undefined
  getEditorIndexById: (editorId: string) => number | undefined
  updateEditorTitle: (id: string, title: string) => void
  updateEditorSvg: (
    editorId: string,
    svgCode?: string,
    extra?: { allowSvgOnly?: boolean }
  ) => boolean
  refreshGroup: () => void
  autoSetIconType: () => void
  setEditorOrderByIds: (editorKeys: string[]) => void
  removeEditor: (id: string, shouldRefresh?: boolean) => void
  clearEditors: () => void
  undoRemoveEditor: (id: string) => void
  searchIcons: (
    query: string,
    iconSetType?: Config['iconSetType']
  ) => Promise<
    Array<{
      url: string
      type: 'outlined' | 'solid'
      iconFullName: string
      name: string
      author: string
      authorUrl: string
      svg: string
    }>
  >
  addEditor: (
    input: string,
    title?: string,
    extra?: { after?: string; toGroupId?: string; removeAfter?: boolean }
  ) => { hasUpdated: boolean; newIndex: number }
  addEditorAfter: (
    editorId?: string,
    editor?: EditorState
  ) => { scrollTo: () => void }
}

interface AppStoreState {
  _hasHydrated: boolean
  updateListHash: number
  groups: Group[]
  activeGroupId: Group['id']
}

const makeGroup = (config?: Config, editors?: EditorState[]) =>
  ({
    id: newId('g'),
    createdAt: Date.now(),
    title: '',
    config: config ?? initialConfig,
    editors: editors ?? [initialEditorData()],
  }) satisfies Group

const initialEditorData = (svgData?: SVGData, title?: string) => {
  return [
    newId('e'),
    {
      title: title ?? '',
      isDeleted: false,
      svg: {
        output: svgData?.output ?? '',
        outputJsx: svgData?.outputJsx ?? '',
        original: svgData?.original ?? '',
        log: svgData?.log ?? [],
        savings: svgData?.savings ?? 0,
      },
      view: {
        doc: svgData?.original ?? '',
        selection: null,
      },
    },
  ] satisfies EditorState
}

const initialGroup = makeGroup()

export const useAppActions = () => useAppStore(state => state.actions)

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
            set({ _hasHydrated: true })
          },

          setConfig(configItem, shouldRefresh = true) {
            const activeGroupId = get().activeGroupId

            set({
              groups: produce(get().groups, draft => {
                const group = draft.find(g => g.id === activeGroupId)
                if (!group) return

                group.config = { ...group.config, ...configItem }
              }),
            })

            shouldRefresh && get().actions.updateSvgOutputs()
          },

          getConfig() {
            const group = get().actions.getGroup()
            if (!group?.config) return initialConfig
            return group.config
          },

          resetConfig() {
            get().actions.setConfig(initialConfig)
          },

          // Groups

          getGroups(params) {
            return get().groups.map(group => ({
              ...group,
              editors: group.editors.filter(e => {
                if (
                  params?.withPlaceholders === false &&
                  e[1].svg.original === ''
                )
                  return false

                return !e[1].isDeleted
              }),
            }))
          },

          addGroup() {
            const config = get().actions.getConfig()
            const newGroup = makeGroup(config)
            set({
              groups: [newGroup, ...get().groups],
              activeGroupId: newGroup.id,
            })
            get().actions.refreshGroup()
            document
              .querySelector(`#header`)
              ?.scrollIntoView({ behavior: 'smooth' })
          },

          removeGroup(id) {
            const groups = get().groups
            if (groups.length <= 1)
              return {
                hasSwitched: false,
                hasRemoved: false,
              }

            const newGroups = groups.filter(g => g.id !== id)
            set({ groups: newGroups })

            if (get().activeGroupId === id) {
              const { hasSwitched } = get().actions.setActiveGroup(
                newGroups[0]?.id
              )
              return { hasSwitched, hasRemoved: true }
            }

            return {
              hasSwitched: false,
              hasRemoved: newGroups.length < groups.length,
            }
          },

          setActiveGroup(activeGroupId) {
            if (get().activeGroupId === activeGroupId)
              return { hasSwitched: false }

            set({ activeGroupId })
            get().actions.refreshGroup()

            return { hasSwitched: true }
          },

          // TODO: run updateSvgOutputs thru this
          updateEditorSvg(editorId, svgCode, extra) {
            const config = get().actions.getConfig()

            let hasUpdated = false
            const isSvg = svgCode?.includes('<svg')
            if (extra?.allowSvgOnly && !isSvg) return hasUpdated

            const groups = produce(get().groups, draft => {
              for (const group of draft) {
                for (const [id, editorData] of group.editors) {
                  if (id !== editorId) continue

                  hasUpdated = true

                  const svg = transformSvg(
                    svgCode ?? editorData.svg.original,
                    config,
                    { title: editorData.title }
                  )

                  editorData.svg = {
                    ...editorData.svg,
                    ...svg,
                    log: svg.log,
                    original: editorData.svg.original || (svgCode ?? ''),
                  } satisfies SVGData

                  editorData.view = {
                    ...editorData.view,
                    doc: svgCode ?? editorData.view?.doc ?? '',
                  } satisfies EditorState[1]['view']

                  return
                }
              }
            }) satisfies Group[]

            set({ groups })
            get().actions.refreshGroup()

            return hasUpdated
          },

          updateSvgOutputs() {
            const activeGroupId = get().activeGroupId
            const config = get().actions.getConfig()

            // const transformSvg = doTransformSvg(config ?? get().config);
            const groups = get().groups.map(group =>
              group.id === activeGroupId
                ? {
                    ...group,
                    editors: group.editors.map(editor => {
                      const editorData = editor[1]
                      const svg = transformSvg(
                        editorData.view?.doc ?? editorData.svg.original,
                        config,
                        { title: editorData.title }
                      )
                      return [
                        editor[0],
                        {
                          ...editorData,
                          svg: {
                            output: svg.output,
                            outputJsx: svg.outputJsx,
                            original: editorData.svg.original,
                            log: svg.log,
                            savings: svg.savings,
                          },
                        },
                      ] satisfies EditorState
                    }),
                  }
                : group
            )

            set({ groups })
            get().actions.refreshGroup()
          },

          updateGroupTitle(groupId, title) {
            set({
              groups: get().groups.map(group =>
                groupId !== group.id ? group : { ...group, title: title.trim() }
              ),
            })

            get().actions.refreshGroup()
          },

          autoSetIconType: () => {
            const editors = get().actions.getEditors({
              withPlaceholders: false,
            })

            if (editors.length === 0) {
              get().actions.setConfig({ iconSetType: 'indeterminate' }, false)
              return
            }

            const isOutlined =
              editors.filter(([, data]) =>
                (data.svg.log ?? []).some(
                  l => l.type === 'data.type' && l.msg === 'outlined'
                )
              ).length >=
              editors.length / 2

            const currentValue = get().actions.getConfig().iconSetType
            if (isOutlined) {
              if (currentValue === 'outlined') return
              get().actions.setConfig({ iconSetType: 'outlined' }, false)
            }
            if (!isOutlined) {
              if (currentValue === 'solid') return
              get().actions.setConfig({ iconSetType: 'solid' }, false)
            }
          },

          refreshGroup: () => {
            // On refresh change the hash and update the type config
            get().actions.autoSetIconType()
            set({ updateListHash: hashCode(newId()) })
          },

          getEditors: params => {
            const activeGroupId = get().activeGroupId

            const editors =
              get()
                .groups.find(g => g.id === activeGroupId)
                ?.editors.filter(e => Boolean(!e[1].isDeleted)) ?? []

            if (params?.withPlaceholders === false)
              return editors.filter(e => e[1].svg.original !== '')

            return editors
          },

          getEditorById: editorId =>
            get()
              .actions.getEditors()
              .find(e => e[0] === editorId),

          getSvgsFromGroupId(groupId: string) {
            const svgs = (
              get().groups.find(g => g.id === groupId)?.editors ?? []
            )
              .map(([, data]) => {
                if (data.isDeleted) return null
                if (!data.svg.output.startsWith('<svg')) return null
                const hasJsxOutput = get().actions.getConfig().outputJsx
                return data.svg[hasJsxOutput ? 'outputJsx' : 'output']
              })
              .filter(Boolean)
              .join('\n')

            return svgs
          },

          getSvgsFromGroupIdForDownload(groupId: string) {
            const svgs = (
              get().groups.find(g => g.id === groupId)?.editors ?? []
            )
              .map(([, data]) => {
                if (data.isDeleted) return null
                if (!data.svg.output.startsWith('<svg')) return null
                const hasJsxOutput = get().actions.getConfig().outputJsx
                return [
                  data.title,
                  data.svg[hasJsxOutput ? 'outputJsx' : 'output'],
                ]
              })
              .filter(Boolean) as Array<[string, string]>

            // De-duplicate titles as they'll cause issues when converting to filenames
            const uniqueElements = new Map<string, string>()
            svgs.forEach(([title, svgCode], i) => {
              const fileName = title.replace(/[^a-z0-9]/gi, '-').toLowerCase()
              const deDupedTitle = uniqueElements.has(fileName)
                ? `${fileName}-duplicate-${i}`
                : fileName
              uniqueElements.set(deDupedTitle, svgCode)
            })

            return [...uniqueElements]
          },

          getGroup(params) {
            const activeGroupId = get().activeGroupId
            return get()
              .actions.getGroups(params)
              .find(g => g.id === activeGroupId)
          },

          searchIcons: async (query, iconSetType) => {
            const res = await fetch(
              `https://api.iconify.design/search?query=${query} palette=false`
            )

            if (!res.ok) {
              // This will activate the closest `error.js` Error Boundary
              throw new Error('Failed to fetch data')
            }

            const json = (await res.json()) as {
              collections: Record<
                string,
                { name: string; author: { url: string } }
              >
              icons: string[]
            }

            const authors = Object.entries(json.collections).map(
              ([folder, data]) => [folder, data.name, data.author.url]
            )

            const icons = await Promise.all(
              json.icons.map(async iconFullName => {
                const [folder, name] = iconFullName.split(':')
                const url = `https://api.iconify.design/${folder}/${name}.svg`
                const iconFetch = await fetch(url)
                const svgData = await iconFetch.text()

                const doc = parseSvg(svgData)
                const svgDoc = doc.querySelector('svg')
                if (!svgDoc) return

                const svgType = getSvgType(svgDoc)

                if (iconSetType && iconSetType !== svgType) return

                const [, author, authorUrl] =
                  authors.find(([folderName]) => folderName === folder) ?? []

                const data = {
                  url,
                  type: svgType,
                  iconFullName,
                  name,
                  author,
                  authorUrl,
                  svg: svgDoc.toString(),
                }

                return data
              })
            )

            const filtered = icons.filter(Boolean) as Array<
              NonNullable<(typeof icons)[number]>
            >
            return filtered
          },

          addEditor: (input, title, extra) => {
            const currentGroup = get().actions.getGroup()
            // currentGroup?.config.iconSetType
            // console.log({ addEditor: true })

            const groupAddingTo =
              // (toGroupId ?? activeGroupId) === undefined
              // ? addGroup()?.id:
              extra?.toGroupId ?? currentGroup?.id ?? get().activeGroupId

            const isSvg = input.includes('<svg')

            // Set the svg type ahead of adding editor so transforms are can be applied
            let config = get().actions.getConfig()
            if (currentGroup?.config.iconSetType === 'indeterminate' && isSvg) {
              const svgType = getSvgType(parseSvg(input))
              get().actions.setConfig({ iconSetType: svgType })
              config = { ...config, iconSetType: svgType }
            }

            const newEditor = isSvg
              ? initialEditorData(
                  {
                    ...transformSvg(input, config, {
                      title: title ?? '',
                    }),
                    original: input,
                  },
                  title
                )
              : initialEditorData(undefined, input)
            const newEditorId = newEditor[0] // Get id for scroll use

            // TODO: Rewrite this to use immer
            const newGroups: Group[] = []

            let hasUpdated = false

            // if (get().groups.length === 0) {
            //   // get current editors
            //   const editors = get().actions.getEditors();
            //   console.log({ editors });

            //   const newGroup = makeGroup(
            //     get().actions.getConfig(),
            //     editors
            //   );
            //   newGroups.push(newGroup);

            //   get().actions.setActiveGroup(newGroup.id);

            //   set({ groups: newGroups });
            //   get().actions.refreshGroup();

            //   return {
            //     scrollTo: () => {},
            //   };
            // }

            let editors: EditorState[] = []

            for (const group of get().groups) {
              if (groupAddingTo !== group.id) {
                newGroups.push(group)
                continue
              }

              hasUpdated = true

              const newEditors = [...group.editors]

              editors = [...group.editors, newEditor]

              if (extra?.after) {
                const index = newEditors.findIndex(e => e[0] === extra.after)
                newEditors.splice(index + 1, 0, newEditor)
                editors = newEditors
              }

              newGroups.push({ ...group, editors })
            }

            set({ groups: newGroups })
            get().actions.refreshGroup()

            if (extra?.removeAfter && extra.after) {
              get().actions.removeEditor(extra.after)
            }

            const newIndex = get()
              .actions.getEditors()
              .findIndex(e => e[0] === newEditorId)

            return {
              hasUpdated,
              newIndex,
            }
          },

          addEditorAfter: (editorId, editor) => {
            const newEditor = editor ?? initialEditorData()

            const newGroups: Group[] = []

            const activeGroupId = get().activeGroupId

            for (const group of get().groups) {
              if (activeGroupId !== group.id) {
                newGroups.push(group)
                continue
              }

              const newEditors = [...group.editors]
              const index = newEditors.findIndex(e => e[0] === editorId)
              newEditors.splice(index + 1, 0, newEditor)

              newGroups.push({ ...group, editors: newEditors })
            }

            set({ groups: newGroups })
            get().actions.refreshGroup()

            return {
              scrollTo: () => {
                setTimeout(() => {
                  document
                    .querySelector(`#${newEditor[0]}`)
                    ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }, 0)
              },
            }
          },

          removeEditor: (id, shouldRefresh = true) => {
            const activeGroupId = get().activeGroupId
            let addEditor = false

            const newGroups = produce(get().groups, group => {
              const groupIndex = group.findIndex(g => g.id === activeGroupId)
              group[groupIndex].editors = produce(
                group[groupIndex].editors,
                editors => {
                  const editorIndex = editors.findIndex(e => e[0] === id)
                  if (editors[editorIndex]) {
                    editors[editorIndex][1].isDeleted = true
                    const editorsLeft = editors.filter(
                      e => !e[1].isDeleted
                    ).length
                    if (editorsLeft === 0) addEditor = true
                  }
                }
              )
            })

            set({ groups: newGroups })

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Incorrect triggered lint
            if (addEditor) get().actions.addEditor('')

            shouldRefresh && get().actions.refreshGroup()
          },

          clearEditors: () => {
            const activeGroupId = get().activeGroupId

            const newGroups = produce(get().groups, group => {
              const groupIndex = group.findIndex(g => g.id === activeGroupId)
              group[groupIndex].editors = []
            })

            set({ groups: newGroups })

            get().actions.refreshGroup()
          },

          undoRemoveEditor: id => {
            const activeGroupId = get().activeGroupId

            const newGroups = produce(get().groups, group => {
              const groupIndex = group.findIndex(g => g.id === activeGroupId)
              group[groupIndex].editors = produce(
                group[groupIndex].editors,
                editor => {
                  const editorIndex = editor.findIndex(e => e[0] === id)
                  editor[editorIndex][1].isDeleted = false
                }
              )
            })

            set({ groups: newGroups })

            get().actions.refreshGroup()
          },

          // TODO: Cleanup editors on load
          cleanEditors: () => {
            const activeGroupId = get().activeGroupId
            const newGroups = get().groups.map(group => {
              if (activeGroupId !== group.id) return group
              const newGroup = {
                ...group,
                editors: group.editors.filter(
                  editor => editor[1].svg.original !== '' || editor[1].isDeleted
                ),
              }
              return newGroup
            })
            set({ groups: newGroups })

            get().actions.refreshGroup()
          },

          getEditorIndexById(editorId) {
            const index = get()
              .actions.getEditors()
              .findIndex(e => e[0] === editorId)

            if (index < 0) return
            return index
          },

          setEditorOrderByIds(editorKeys) {
            const activeGroupId = get().activeGroupId

            const sortEditorsByEditorKeys = (
              a: EditorState,
              b: EditorState
            ) => {
              const x = editorKeys.indexOf(a[0])
              const y = editorKeys.indexOf(b[0])
              if (x > y) return 1
              if (x < y) return -1
              return 0
            }

            const groups = get().groups.map(group => {
              if (activeGroupId !== group.id) return group

              const resorted = group.editors
                .slice()
                .sort(sortEditorsByEditorKeys)

              const newGroup = { ...group, editors: resorted }
              return newGroup
            })

            set({ groups })
            setTimeout(() => {
              get().actions.refreshGroup()
            }, 0)
          },

          updateEditorTitle: (id: string, title: string) => {
            const activeGroupId = get().activeGroupId
            const groups = get().groups.map(group => {
              if (activeGroupId !== group.id) return group
              const newGroup = {
                ...group,
                editors: group.editors.map(editor => {
                  if (editor[0] === id)
                    return [
                      id,
                      { ...editor[1], title: title.toLowerCase().trim() },
                    ] satisfies EditorState
                  return editor
                }),
              }
              return newGroup
            })
            set({ groups })
          },
        },
      }),
      {
        name: 'iconish',
        partialize: ({ actions: _, ...rest }) => rest,
        onRehydrateStorage: () => state => {
          state?.actions.setHydrated()
        },
        // storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
      }
    )
  )
)
