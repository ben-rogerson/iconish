import { plusIcon } from '@/lib/icons'
import { GroupSet } from '@/components/GroupSet'
import { useAppActions, useAppStore } from '@/hooks/appState'
import { Button } from '@/components/ui/button'

const List = () => {
  const { addGroup, getGroups } = useAppActions()
  const activeGroupId = useAppStore(s => s.activeGroupId)

  const groups = getGroups()

  const icons = groups.map(g => {
    const iconsAll = g.editors.filter(
      ([, data]) =>
        data.svg.output &&
        data.svg.output !== '<html xmlns="http://www.w3.org/1999/xhtml"/>'
    )
    const count = iconsAll.length
    const iconsLimit = iconsAll.slice(0, 10)
    return { ...g, count, icons: iconsLimit }
  })

  return (
    <div id="sets" className="grid gap-9">
      <div className="flex items-center justify-between pt-4">
        <h2 className="text-xl">Icon sets</h2>
        <div>
          <Button
            onClick={() => {
              addGroup()
            }}
            className="w-full"
            variant="ghost"
            size="sm"
          >
            {plusIcon} New set
          </Button>
        </div>
      </div>

      {groups.length > 0 &&
        icons.map(g => (
          <GroupSet
            key={g.id}
            id={g.id}
            title={g.title}
            isHeader={false}
            createdAt={g.createdAt}
            icons={g.icons}
            count={g.count}
            isCurrent={g.id === activeGroupId}
          />
        ))}
    </div>
  )
}

export { List }
