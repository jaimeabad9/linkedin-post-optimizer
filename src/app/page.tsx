'use client'

import { useState, useEffect } from 'react'
import type { AnalysisResult, RewriteVersion, RewriteResult } from '@/types/analysis'
import ScoreCard from '@/components/ScoreCard'

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

const PLACEHOLDER_TEXT = `Paste your LinkedIn post here...

Example:
"Most CRM implementations fail before go-live.
Not because of the software. Because of the data.
I spent 6 months rebuilding a CRM no one was using.
Here's what I found..."`

// Staged messages for the analysis loading state
const LOADING_MESSAGES = [
  'Classifying post type...',
  'Analysing hook strength...',
  'Evaluating readability...',
  'Checking authenticity signals...',
  'Assessing engagement potential...',
  'Scanning content patterns...',
  'Calculating scores...',
]

// Staged messages for the rewrite loading state
const REWRITE_MESSAGES = [
  'Preserving your voice...',
  'Sharpening the hook...',
  'Improving specificity...',
  'Refining structure and rhythm...',
  'Finalising versions...',
]

// ─────────────────────────────────────────────────────────────
// SMALL UTILITY COMPONENTS
// ─────────────────────────────────────────────────────────────

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Strong'
  if (score >= 70) return 'Good'
  if (score >= 50) return 'Needs work'
  return 'Weak'
}

function getScoreColor(score: number): string {
  if (score >= 70) return 'text-brand-teal'
  if (score >= 50) return 'text-amber-500'
  return 'text-red-500'
}

function getBarColor(score: number): string {
  if (score >= 70) return 'bg-brand-teal'
  if (score >= 50) return 'bg-amber-400'
  return 'bg-red-400'
}

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="w-48 h-px bg-brand-grey mt-4 overflow-hidden">
      <div className={`h-full ${getBarColor(score)}`} style={{ width: `${score}%` }} />
    </div>
  )
}

function PostTypeBadge({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 border border-brand-teal/25
                     bg-brand-teal-light text-brand-teal text-xs font-semibold
                     tracking-widest uppercase">
      {type}
    </span>
  )
}

function QualityFlag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 border border-brand-grey
                     bg-brand-stone text-brand-charcoal text-xs">
      {label}
    </span>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold tracking-widest uppercase text-brand-charcoal/60 mb-3">
      {children}
    </p>
  )
}

// ─────────────────────────────────────────────────────────────
// REWRITE CARD
// Each card shows a single improved version with a copy button.
// ─────────────────────────────────────────────────────────────

function RewriteCard({ version, index }: { version: RewriteVersion; index: number }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      // Modern browsers — uses the Clipboard API, no libraries needed
      await navigator.clipboard.writeText(version.content)
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea')
      el.value = version.content
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="border border-brand-grey">

      {/* Card header — version name, approach, copy button */}
      <div className="flex items-start justify-between gap-4 px-5 py-4
                      border-b border-brand-grey bg-brand-stone">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-widest uppercase text-brand-dark">
            Version {index + 1} — {version.title}
          </p>
          <p className="text-xs text-brand-charcoal mt-1 leading-relaxed">
            {version.approach}
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 px-3 py-1.5 border border-brand-grey text-xs
                     text-brand-charcoal hover:border-brand-teal hover:text-brand-teal
                     transition-colors whitespace-nowrap"
        >
          {copied ? 'Copied ✓' : 'Copy'}
        </button>
      </div>

      {/* Card body — the rewritten post */}
      {/* whitespace-pre-line preserves the deliberate line breaks in LinkedIn posts */}
      <div className="px-5 py-5">
        <p className="text-sm text-brand-dark leading-relaxed whitespace-pre-line">
          {version.content}
        </p>
      </div>

    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────

export default function Home() {
  // Analysis state
  const [post, setPost] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingIndex, setLoadingIndex] = useState(0)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Rewrite state
  const [rewriteResult, setRewriteResult] = useState<RewriteResult | null>(null)
  const [rewriteLoading, setRewriteLoading] = useState(false)
  const [rewriteLoadingIndex, setRewriteLoadingIndex] = useState(0)
  const [rewriteError, setRewriteError] = useState<string | null>(null)

  // Cycle through analysis loading messages
  useEffect(() => {
    if (!loading) { setLoadingIndex(0); return }
    const interval = setInterval(() => {
      setLoadingIndex(prev => Math.min(prev + 1, LOADING_MESSAGES.length - 1))
    }, 1600)
    return () => clearInterval(interval)
  }, [loading])

  // Cycle through rewrite loading messages
  useEffect(() => {
    if (!rewriteLoading) { setRewriteLoadingIndex(0); return }
    const interval = setInterval(() => {
      setRewriteLoadingIndex(prev => Math.min(prev + 1, REWRITE_MESSAGES.length - 1))
    }, 1800)
    return () => clearInterval(interval)
  }, [rewriteLoading])

  async function handleAnalyze() {
    if (!post.trim() || loading) return
    setLoading(true)
    setError(null)
    setResult(null)
    setRewriteResult(null)
    setRewriteError(null)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        return
      }
      setResult(data)
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch {
      setError('Connection failed. Check your internet connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGenerateRewrites() {
    if (!result || rewriteLoading) return
    setRewriteLoading(true)
    setRewriteError(null)

    try {
      const response = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post,
          scores: {
            hook: result.hook_score,
            readability: result.readability_score,
            authenticity: result.authenticity_score,
            engagement: result.engagement_score,
            genericness: result.ai_genericness_score,
          },
          flags: result.content_quality_flags,
          summary: result.summary,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        setRewriteError(data.error || 'Could not generate rewrites. Please try again.')
        return
      }
      setRewriteResult(data)
      setTimeout(() => {
        document.getElementById('rewrites')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch {
      setRewriteError('Connection failed. Please try again.')
    } finally {
      setRewriteLoading(false)
    }
  }

  function handleReset() {
    setResult(null)
    setPost('')
    setError(null)
    setRewriteResult(null)
    setRewriteError(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── NAVIGATION ── */}
      <nav className="border-b border-brand-grey bg-white sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-0.5 h-5 bg-brand-teal" />
            <span className="font-bold text-brand-dark text-sm tracking-widest uppercase">
              LinkedIn Post Optimizer
            </span>
          </div>
          <span className="text-xs text-brand-charcoal hidden sm:block">
            AI-powered post analysis
          </span>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="bg-brand-dark">
        <div className="max-w-3xl mx-auto px-6 py-14">
          <div className="w-8 h-px bg-brand-teal mb-7" />
          <h1 className="text-4xl font-bold text-white mb-3 leading-tight tracking-tight">
            Score your LinkedIn post.
          </h1>
          <p className="text-white/65 text-base leading-relaxed max-w-lg">
            Paste any post and get a structured breakdown of hook strength, readability,
            authenticity, engagement potential, and content quality — with specific
            suggestions and improved versions.
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-6">
            {['Hook', 'Readability', 'Authenticity', 'Engagement', 'Content Quality'].map((label) => (
              <span key={label} className="text-xs text-white/30 uppercase tracking-widest">
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAIN ── */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">

        {/* Input */}
        <div className="mb-5">
          <label
            htmlFor="post-input"
            className="block text-xs font-semibold tracking-widest uppercase text-brand-charcoal mb-3"
          >
            Your LinkedIn Post
          </label>
          <textarea
            id="post-input"
            value={post}
            onChange={(e) => setPost(e.target.value)}
            placeholder={PLACEHOLDER_TEXT}
            rows={11}
            className="w-full border border-brand-grey p-4 text-brand-dark text-sm
                       leading-relaxed placeholder:text-brand-grey/70 focus:border-brand-teal
                       resize-none transition-colors bg-white"
          />
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-xs text-brand-charcoal">{post.length} characters</span>
            <span className={`text-xs ${post.length > 3000 ? 'text-amber-500 font-medium' : 'text-brand-charcoal'}`}>
              {post.length > 3000 ? '⚠ Over typical LinkedIn limit' : 'Recommended under 3,000 characters'}
            </span>
          </div>
        </div>

        {/* Analyze button — shows the current loading message as its label */}
        <button
          onClick={handleAnalyze}
          disabled={loading || !post.trim()}
          className="w-full bg-brand-teal text-white font-semibold text-xs tracking-widest
                     uppercase py-4 transition-opacity hover:opacity-90
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? LOADING_MESSAGES[loadingIndex] : 'Analyse Post'}
        </button>

        {/* Error */}
        {error && (
          <div className="mt-6 p-4 border border-red-200 bg-red-50 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ── LOADING SKELETON ── */}
        {/* Mirrors the real result layout so there's no layout jump when results arrive */}
        {loading && (
          <div className="mt-14 animate-pulse" aria-hidden="true">
            <div className="pb-10 border-b border-brand-grey mb-10">
              <div className="h-6 w-28 bg-brand-grey mb-5" />
              <div className="flex items-baseline gap-3">
                <div className="h-16 w-20 bg-brand-grey" />
                <div className="space-y-1.5">
                  <div className="h-3 w-10 bg-brand-grey" />
                  <div className="h-3 w-14 bg-brand-grey" />
                </div>
              </div>
              <div className="h-px w-48 bg-brand-grey mt-4" />
              <div className="mt-6 border-l-2 border-brand-grey pl-5 space-y-2">
                <div className="h-3 bg-brand-grey w-full" />
                <div className="h-3 bg-brand-grey w-5/6" />
                <div className="h-3 bg-brand-grey w-4/6" />
              </div>
            </div>
            <div className="mb-10">
              <div className="h-2 bg-brand-grey w-20 mb-3" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-brand-grey" />)}
              </div>
            </div>
            <div>
              <div className="h-2 bg-brand-grey w-20 mb-3" />
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-4 mb-2.5 p-4 border border-brand-grey">
                  <div className="h-5 w-5 bg-brand-grey flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-brand-grey w-full" />
                    <div className="h-3 bg-brand-grey w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── RESULTS ── */}
        {result && !loading && (
          <div id="results" className="mt-14">

            {/* ─ Block 1: Score + Summary ─ */}
            <div className="pb-10 border-b border-brand-grey">
              <div className="mb-5">
                <PostTypeBadge type={result.post_type} />
              </div>
              <div className="flex items-baseline gap-3">
                <span className={`text-7xl font-bold leading-none tabular-nums ${getScoreColor(result.overall_score)}`}>
                  {result.overall_score}
                </span>
                <div>
                  <p className="text-sm text-brand-charcoal leading-none">/100</p>
                  <p className={`text-sm font-semibold mt-1.5 ${getScoreColor(result.overall_score)}`}>
                    {getScoreLabel(result.overall_score)}
                  </p>
                </div>
              </div>
              <ScoreBar score={result.overall_score} />
              <div className="mt-6 border-l-2 border-brand-teal pl-5">
                <p className="text-brand-dark text-sm leading-relaxed">{result.summary}</p>
              </div>
            </div>

            {/* ─ Block 2: Dimension Breakdown ─ */}
            <div className="py-10 border-b border-brand-grey">
              <SectionLabel>Breakdown</SectionLabel>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <ScoreCard label="Hook" score={result.hook_score} description="Opening line strength" />
                <ScoreCard label="Readability" score={result.readability_score} description="Clarity and structure" />
                <ScoreCard label="Authenticity" score={result.authenticity_score} description="Specificity and voice" />
                <ScoreCard label="Engagement" score={result.engagement_score} description="Likely to drive comments" />
                <ScoreCard label="Content Quality" score={result.ai_genericness_score} inverted={true} description="Higher = more original" />
              </div>
            </div>

            {/* ─ Block 3: Flagged Patterns ─ */}
            {result.content_quality_flags && result.content_quality_flags.length > 0 && (
              <div className="py-10 border-b border-brand-grey">
                <SectionLabel>Flagged Patterns</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {result.content_quality_flags.map((flag, i) => (
                    <QualityFlag key={i} label={flag} />
                  ))}
                </div>
                {result.ai_genericness_score > 65 && (
                  <div className="mt-4 p-4 border border-amber-200 bg-amber-50">
                    <p className="text-xs font-semibold tracking-widest uppercase text-amber-600 mb-1.5">
                      Generic Content Detected
                    </p>
                    <p className="text-sm text-amber-800 leading-relaxed">
                      This post contains writing patterns that reduce credibility —
                      generic phrasing, lack of specificity, or formulaic structure.
                      The suggestions below target the weakest sections.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ─ Block 4: What to Fix ─ */}
            <div className="py-10 border-b border-brand-grey">
              <SectionLabel>What to Fix</SectionLabel>
              <div className="space-y-2.5">
                {result.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="flex gap-4 p-4 border border-brand-grey hover:border-brand-teal/40 transition-colors"
                  >
                    <div className="flex-shrink-0 w-5 h-5 border border-brand-teal/40
                                    bg-brand-teal-light text-brand-teal text-xs font-bold
                                    flex items-center justify-center mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-sm text-brand-dark leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ─ Block 5: Improved Versions ─ */}
            {/* Only rendered after the user clicks the button.
                This is intentional — read the diagnosis first, then request rewrites. */}
            <div id="rewrites" className="py-10 border-b border-brand-grey">

              {!rewriteResult && !rewriteLoading && (
                <>
                  <SectionLabel>Improved Versions</SectionLabel>
                  <p className="text-sm text-brand-charcoal leading-relaxed mb-5 max-w-xl">
                    Generate three targeted rewrites based on the analysis above. Each version
                    improves a specific dimension — hook, specificity, or rhythm — while
                    preserving your voice and original intent.
                  </p>
                  {rewriteError && (
                    <div className="mb-4 p-4 border border-red-200 bg-red-50 text-sm text-red-700">
                      {rewriteError}
                    </div>
                  )}
                  <button
                    onClick={handleGenerateRewrites}
                    className="px-5 py-2.5 border border-brand-teal text-brand-teal text-xs
                               font-semibold tracking-widest uppercase hover:bg-brand-teal
                               hover:text-white transition-colors"
                  >
                    Generate Improved Versions
                  </button>
                </>
              )}

              {/* Rewrite loading state */}
              {rewriteLoading && (
                <>
                  <SectionLabel>Improved Versions</SectionLabel>
                  <p className="text-xs text-brand-charcoal mb-5">
                    {REWRITE_MESSAGES[rewriteLoadingIndex]}
                  </p>
                  <div className="animate-pulse space-y-3" aria-hidden="true">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="border border-brand-grey">
                        <div className="px-5 py-4 border-b border-brand-grey bg-brand-stone space-y-2">
                          <div className="h-2.5 bg-brand-grey w-40" />
                          <div className="h-2 bg-brand-grey w-64" />
                        </div>
                        <div className="px-5 py-5 space-y-2">
                          <div className="h-2.5 bg-brand-grey w-full" />
                          <div className="h-2.5 bg-brand-grey w-5/6" />
                          <div className="h-2.5 bg-brand-grey w-4/6" />
                          <div className="h-2.5 bg-brand-grey w-full" />
                          <div className="h-2.5 bg-brand-grey w-3/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Rewrite results */}
              {rewriteResult && !rewriteLoading && (
                <>
                  <SectionLabel>Improved Versions</SectionLabel>
                  <div className="space-y-3">
                    {rewriteResult.versions.map((version, i) => (
                      <RewriteCard key={i} version={version} index={i} />
                    ))}
                  </div>
                </>
              )}

            </div>

            {/* Reset */}
            <div className="pt-6 flex items-center justify-between">
              <button
                onClick={handleReset}
                className="text-sm text-brand-charcoal hover:text-brand-teal transition-colors"
              >
                ← Analyse another post
              </button>
              <span className="text-xs text-brand-charcoal/40">
                Powered by OpenAI GPT-4o mini
              </span>
            </div>

          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-brand-grey mt-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-brand-dark">
                LinkedIn Post Optimizer
              </p>
              <p className="text-xs text-brand-charcoal mt-1">
                Built with Next.js · OpenAI · Tailwind CSS
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-px h-8 bg-brand-grey hidden sm:block" />
              <div>
                <p className="text-xs font-semibold text-brand-dark">Jaime Abad</p>
                <p className="text-xs text-brand-charcoal">Revenue &amp; GTM Operations</p>
              </div>
              <a
                href="https://www.linkedin.com/in/jaime-abad-caldeiro/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-brand-charcoal/40
                           text-xs font-medium text-brand-dark hover:border-brand-teal
                           hover:text-brand-teal hover:bg-brand-teal-light/40 transition-colors"
              >
                LinkedIn ↗
              </a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
