import { useAppActions } from '@/hooks/appState'
import { useCallback, useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { run } from '@/utils/run'
import { InputIcon } from '@/components/InputIcon'
import { pluralize } from '../../../utils/pluralize'
import { SearchIcon } from '@/lib/icons'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import Link from 'next/link'

type ExternalIconData = {
  url: string
  type: 'outlined' | 'solid'
  iconFullName: string
  name: string
  author: string
  authorUrl: string
  svg: string
}

export default function Search(props: {
  handleOnAfterAddExternalIcon: (svgCode: string, name: string) => void
}) {
  const { searchIcons, getConfig } = useAppActions()
  const [results, setResults] = useState<ExternalIconData[]>([])
  const [keywords, setKeywords] = useState('')
  const [activeKeywords, setActiveKeywords] = useState('')
  const [searching, setSearching] = useState(false)
  const type = getConfig().iconSetType

  const search = useCallback(
    async (query: string) => {
      setSearching(true)
      setActiveKeywords(query)
      setResults([])
      const res = await searchIcons(query, type)
      setResults(res)
      setSearching(false)
    },
    [searchIcons, type]
  )

  const handleClearResults = () => {
    setResults([])
    setActiveKeywords('')
    setKeywords('')
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      void run(async () => {
        if (keywords === '') return
        if (keywords.trim() === activeKeywords.trim()) return
        await search(keywords)
      })
    }, 500)

    return () => {
      clearTimeout(delayDebounceFn)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keywords])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex h-full w-full items-center justify-center gap-3 rounded border bg-background px-5 py-3"
        >
          <div>
            <SearchIcon className="h-[1em] w-[1em] text-3xl" />
          </div>
          <div>Search</div>
        </button>
      </DialogTrigger>
      <DialogContent className="gap-6 px-6 py-8 sm:max-w-2xl sm:px-20 sm:py-16">
        <DialogHeader>
          <DialogTitle className="font-serif text-3xl">
            Search for icons
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-8">
          <InputIcon
            type="text"
            placeholder="right, arrow, user, etc"
            className="w-full"
            value={keywords}
            startIcon={SearchIcon}
            onChange={e => {
              const query = e.target.value
              if (query === '') {
                handleClearResults()
                return
              }
              setKeywords(query)
            }}
          />
          {Boolean(searching) && <p>Searching...</p>}
          {Boolean(!searching && activeKeywords) && (
            <div className="grid gap-3">
              <h2>
                Found {results.length} {pluralize(results.length, 'icon')}{' '}
                labelled “{activeKeywords}”
              </h2>
              {Boolean(results.length > 0) && (
                <div className="grid max-h-[50dvh] grid-cols-4 gap-2 overflow-y-scroll pr-4">
                  {results.map(data => {
                    const link = data.authorUrl ? (
                      <Link
                        href={data.authorUrl}
                        target="_blank"
                        className="underline"
                      >
                        {data.author}
                      </Link>
                    ) : (
                      data.author
                    )
                    return (
                      <TooltipProvider key={data.iconFullName}>
                        <Tooltip>
                          <TooltipTrigger
                            type="button"
                            onClick={() => {
                              props.handleOnAfterAddExternalIcon(
                                data.svg,
                                data.name
                              )
                            }}
                            className="relative grid place-content-center gap-3 rounded-lg border p-4 hover:border-muted"
                          >
                            <Icon
                              icon={data.iconFullName}
                              style={{ fontSize: '300%' }}
                              className="mx-auto"
                            />
                            {type === 'indeterminate' && (
                              <div className="mt-1 text-xs text-muted">
                                {data.type}
                              </div>
                            )}
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <div className="grid gap-1 text-center">
                              <div className="text-lg font-bold">
                                {data.name}
                              </div>
                              <div>{link}</div>
                              {type !== 'indeterminate' && (
                                <div className="mt-1 text-xs">{data.type}</div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
