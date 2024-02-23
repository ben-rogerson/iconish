import JSZip from 'jszip'
import { useCopyToClipboard } from 'usehooks-ts'
import { useAppActions } from '@/hooks/appState'
import { useToast } from '@/components/ui/use-toast'

export const useCopySvgsToClipboard = (groupId: string) => {
  const { getSvgsFromGroupId } = useAppActions()
  const [hasCopied, setCopied] = useCopyToClipboard()

  return {
    copy: () => {
      void setCopied(getSvgsFromGroupId(groupId))
    },
    hasCopied,
  }
}

const zip = new JSZip()

export const useDownloadSvgsForGroup = (groupId: string, title: string) => {
  const { getConfig, getSvgsFromGroupIdForDownload } = useAppActions()
  const { toast } = useToast()

  return () => {
    getSvgsFromGroupIdForDownload(groupId).forEach(([fileName, svgCode]) => {
      zip.file(`${fileName}.svg`, svgCode)
    })
    zip.generateAsync({ type: 'blob' }).then(
      content => {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(content)
        const fileName = (title || 'Untitled-set')
          .replace(/[^a-z0-9]/gi, '-')
          .toLowerCase()
        const date = new Date().toISOString().split('T')[0].replace(/-/g, '')
        a.download = `${fileName}${
          getConfig().outputJsx ? '-(jsx)' : ''
        }-${date}.zip`
        a.click()
      },
      error => {
        const description =
          error instanceof Error ? error.message : String(error)
        toast({
          title: 'There was an error downloading the svg files',
          description,
        })
      }
    )
  }
}
