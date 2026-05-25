// ScoreCard — displays a single scoring dimension
// The top colour bar gives instant visual feedback before reading the number

interface ScoreCardProps {
  label: string
  score: number        // Raw 0–100 from OpenAI
  description?: string
  inverted?: boolean   // true for AI score: high raw = bad, so we flip the display
}

// Determine colour theme based on the effective (displayed) score.
// Must use complete Tailwind class strings — dynamic class construction gets purged.
function getTheme(effectiveScore: number): {
  bar: string    // top accent bar
  text: string   // score number colour
  bg: string     // card background
  border: string // card border
} {
  if (effectiveScore >= 70) {
    return {
      bar:    'bg-brand-teal',
      text:   'text-brand-teal',
      bg:     'bg-white',
      border: 'border-brand-grey',
    }
  }
  if (effectiveScore >= 50) {
    return {
      bar:    'bg-amber-400',
      text:   'text-amber-500',
      bg:     'bg-white',
      border: 'border-amber-200',
    }
  }
  return {
    bar:    'bg-red-400',
    text:   'text-red-500',
    bg:     'bg-white',
    border: 'border-red-200',
  }
}

export default function ScoreCard({
  label,
  score,
  description,
  inverted = false,
}: ScoreCardProps) {
  // For AI/genericness: raw score 80 (very generic) → displays as 20 (bad)
  const displayScore = inverted ? 100 - score : score
  const theme = getTheme(displayScore)

  return (
    <div className={`rounded border overflow-hidden ${theme.border} ${theme.bg}`}>
      {/* Top colour accent bar — coloured by score range */}
      <div className={`h-1 w-full ${theme.bar}`} />

      <div className="p-4">
        {/* Score number */}
        <div className="flex items-baseline gap-1">
          <span className={`text-3xl font-bold leading-none ${theme.text}`}>
            {displayScore}
          </span>
          <span className="text-xs text-brand-charcoal">/100</span>
        </div>

        {/* Label */}
        <div className="text-xs font-semibold tracking-widest uppercase text-brand-charcoal mt-2.5">
          {label}
        </div>

        {/* Optional description */}
        {description && (
          <div className="text-xs text-brand-charcoal/70 mt-1 leading-relaxed">
            {description}
          </div>
        )}
      </div>
    </div>
  )
}
