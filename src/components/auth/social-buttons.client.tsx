import { Button } from '@/components/ui/button'
import { IconBrandGithub, IconBrandDiscord } from '@tabler/icons-react'
import { signInWithGitHub, signInWithDiscord } from '@/auth'
import { useState } from 'react'

export interface SocialButtonsProps {
    onStateChange: (loading: boolean) => void
}

export function SocialButtons({ onStateChange }: SocialButtonsProps) {
    const [githubLoading, setGithubLoading] = useState(false)
    const [discordLoading, setDiscordLoading] = useState(false)

    async function handleGitHub() {
        try {
            setGithubLoading(true)
            onStateChange(true)
            await signInWithGitHub()
        } catch (error) {
            console.error('GitHub login error:', error)
            setGithubLoading(false)
            onStateChange(false)
        }
    }

    async function handleDiscord() {
        try {
            setDiscordLoading(true)
            onStateChange(true)
            await signInWithDiscord()
        } catch (error) {
            console.error('Discord login error:', error)
            setDiscordLoading(false)
            onStateChange(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-border"></div>
                <span className="text-xs uppercase text-muted-foreground">
                    Or continue with
                </span>
                <div className="h-px flex-1 bg-border"></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleGitHub}
                    disabled={githubLoading || discordLoading}
                >
                    <IconBrandGithub className="mr-2 h-4 w-4" />
                    {githubLoading ? '...' : 'GitHub'}
                </Button>
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleDiscord}
                    disabled={githubLoading || discordLoading}
                >
                    <IconBrandDiscord className="mr-2 h-4 w-4" />
                    {discordLoading ? '...' : 'Discord'}
                </Button>
            </div>
        </div>
    )
}
