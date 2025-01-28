import { Checkbox } from '@/components/ui/checkbox'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'

interface WebsiteLinksPopoverProps {
    links: string[]
    selectedPaths: string[]
    onPathsChange: (paths: string[]) => void
}

function getDisplayPath(url: string): string {
    try {
        const urlObj = new URL(url)
        return (
            urlObj.hostname + (urlObj.pathname === '/' ? '' : urlObj.pathname)
        )
    } catch {
        return url
    }
}

export function WebsiteLinksPopover({
    links,
    selectedPaths,
    onPathsChange,
}: WebsiteLinksPopoverProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className="font-medium text-primary hover:underline"
                >
                    {selectedPaths.length} page
                    {selectedPaths.length === 1 ? '' : 's'}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
                <div className="p-4 pb-2">
                    <div>
                        <h4 className="font-medium leading-none">
                            Your website pages
                        </h4>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Select which pages to index for help content
                        </p>
                    </div>
                </div>
                <ScrollArea className="h-[200px] border-t">
                    <div className="py-1.5 pl-2">
                        <ul className="space-y-1">
                            <li className="flex items-center space-x-1">
                                <Checkbox
                                    id="select-all"
                                    checked={
                                        selectedPaths.length === links.length
                                    }
                                    onCheckedChange={checked => {
                                        onPathsChange(checked ? [...links] : [])
                                    }}
                                />
                                <label
                                    htmlFor="select-all"
                                    className="cursor-pointer select-none text-[9px] font-medium leading-none"
                                >
                                    All Pages
                                </label>
                            </li>
                            {links.map(link => (
                                <li
                                    key={link}
                                    className="flex items-center space-x-1"
                                >
                                    <Checkbox
                                        id={link}
                                        checked={selectedPaths.includes(link)}
                                        onCheckedChange={checked => {
                                            if (checked) {
                                                onPathsChange([
                                                    ...selectedPaths,
                                                    link,
                                                ])
                                            } else {
                                                onPathsChange(
                                                    selectedPaths.filter(
                                                        p => p !== link,
                                                    ),
                                                )
                                            }
                                        }}
                                    />
                                    <label
                                        htmlFor={link}
                                        className="cursor-pointer select-none text-[9px] leading-none"
                                    >
                                        {getDisplayPath(link)}
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>
                </ScrollArea>
            </PopoverContent>
        </Popover>
    )
}
