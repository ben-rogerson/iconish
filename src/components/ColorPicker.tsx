'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Paintbrush } from 'lucide-react'
import { useState } from 'react'

export function ColorPicker({
  color,
  id,
  setColor,
  className,
  onBlur,
  disabled,
}: {
  id: string
  color: string
  setColor: (color: string) => void
  onBlur: (color: string) => void
  className?: string
  disabled: boolean
}) {
  const solids = [
    'currentColor',
    '#ff75c3',
    '#ffa647',
    '#ffe83f',
    '#9fff5b',
    '#70e2ff',
    '#cd93ff',
    '#FFF',
    '#000',
  ]

  return (
    <Popover>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          id={id}
          variant="outline"
          className={cn(
            'w-[220px] justify-start text-left font-normal',
            !color && 'text-muted-foreground',
            className
          )}
        >
          <div className="flex w-full gap-2">
            {color ? (
              <div className="h-4 w-4 rounded bg-current" style={{ color }} />
            ) : (
              <Paintbrush className="h-4 w-4" />
            )}
            <div className="flex-1 truncate">
              {color ? color : 'Pick a color'}
            </div>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="flex gap-1">
          {solids.map(s => (
            <button
              type="button"
              key={s}
              style={{
                color: s === 'currentColor' ? 'var(--text-muted)' : s,
              }}
              className="h-6 w-6 cursor-pointer rounded-md border bg-current active:scale-105"
              onClick={() => {
                setColor(s)
              }}
            />
          ))}
        </div>

        <Input
          value={color}
          className="col-span-2 mt-4 h-8"
          onChange={e => {
            setColor(e.currentTarget.value)
          }}
          onBlur={e => {
            onBlur(e.currentTarget.value)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
