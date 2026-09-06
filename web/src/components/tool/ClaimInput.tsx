'use client'

import { useRef, useState } from 'react'
import { motion } from 'motion/react'
import type { ChangeEvent, FormEvent } from 'react'

interface ClaimInputProps {
  onSubmit: (claim: string, media?: string) => void
  loading: boolean
}

/**
 * The claim input module. Textarea, optional media drop zone and the Verify
 * button. Loading state uses a skeleton shimmer bar, never a spinner.
 * @param props - onSubmit callback and loading flag
 * @returns the input module card
 */
export default function ClaimInput({ onSubmit, loading }: ClaimInputProps) {
  const [claim, setClaim] = useState('')
  const [fileName, setFileName] = useState('')
  const [media, setMedia] = useState<string | undefined>(undefined)
  const fileRef = useRef<HTMLInputElement>(null)

  /**
   * Downscales a picked image to at most 1280px on the long edge so the data
   * URL stays well inside the serverless request body limit.
   * @param file - the picked image file
   * @returns the downscaled JPEG data URL
   */
  const downscaleImage = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const image = new Image()
      const url = URL.createObjectURL(file)
      image.onload = (): void => {
        const scale = Math.min(1, 1280 / Math.max(image.width, image.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(image.width * scale)
        canvas.height = Math.round(image.height * scale)
        const context = canvas.getContext('2d')
        if (!context) {
          URL.revokeObjectURL(url)
          reject(new Error('canvas unavailable'))
          return
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        URL.revokeObjectURL(url)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      image.onerror = (): void => {
        URL.revokeObjectURL(url)
        reject(new Error('unreadable image'))
      }
      image.src = url
    })

  /**
   * Reads the picked media into a data URL for the Bitmind check. Images are
   * downscaled first; videos pass through untouched.
   * @param event - the file input change event
   */
  const handleFile = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    if (file.type.startsWith('image/')) {
      downscaleImage(file)
        .then((dataUrl) => setMedia(dataUrl))
        .catch(() => setMedia(undefined))
      return
    }
    const reader = new FileReader()
    reader.onload = (): void => setMedia(typeof reader.result === 'string' ? reader.result : undefined)
    reader.readAsDataURL(file)
  }

  /**
   * Fires the verify fan-out when the claim is non-empty.
   * @param event - the form submit event
   */
  const handleSubmit = (event: FormEvent): void => {
    event.preventDefault()
    if (!claim.trim() || loading) return
    onSubmit(claim.trim(), media)
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 w-full max-w-2xl liquid-glass p-5 md:p-6 text-left">
      <textarea
        value={claim}
        onChange={(event) => setClaim(event.target.value)}
        placeholder="e.g. This video of the earthquake is from last year"
        disabled={loading}
        className="w-full bg-white/70 border border-[var(--border-default)] rounded-[var(--radius-md)] p-4 font-mono text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-[var(--accent)]/30 outline-none min-h-[88px] resize-none"
      />
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-sm)] border border-dashed border-[var(--border-default)] text-[var(--text-muted)] font-body text-xs hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors duration-150"
        >
          Attach image or video (Bitmind checks it)
        </button>
        <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleFile} className="hidden" />
        {fileName && (
          <span className="font-mono text-xs text-[var(--text-secondary)] truncate max-w-[180px]">
            {fileName}
          </span>
        )}
      </div>
      <button
        type="submit"
        disabled={loading}
        className="mt-4 w-full bg-[var(--accent)] text-white px-6 py-3.5 rounded-full font-body text-sm font-medium hover:bg-[var(--accent-hover)] hover:shadow-[0_0_30px_rgba(37,99,235,0.25)] transition-all duration-200 disabled:opacity-70"
      >
        {loading ? 'Asking miners...' : 'Verify claim'}
      </button>
      {loading && (
        <div className="mt-3 h-1.5 w-full rounded-full overflow-hidden skeleton-shimmer" aria-hidden />
      )}
    </form>
  )
}
