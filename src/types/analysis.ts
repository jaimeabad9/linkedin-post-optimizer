// All TypeScript types for the app.
// TypeScript uses these to catch mistakes at build time — before they become runtime bugs.

// ── Analysis ──────────────────────────────────────────────────────────────────

export interface AnalysisResult {
  post_type: string              // e.g. "Thought Leadership", "Storytelling"
  overall_score: number          // 0–100, weighted average
  hook_score: number             // 0–100, opening line strength
  readability_score: number      // 0–100, clarity and structure
  authenticity_score: number     // 0–100, specificity and human feel
  engagement_score: number       // 0–100, likely to drive comments/shares
  ai_genericness_score: number   // 0–100, higher = more generic (bad)
  content_quality_flags: string[] // e.g. ["lacks specificity", "weak hook"]
  summary: string                // 2–3 sentence honest assessment
  recommendations: string[]      // 4 specific, actionable improvements
}

export interface AnalysisError {
  error: string
}

// ── Rewrites ──────────────────────────────────────────────────────────────────

export interface RewriteVersion {
  title: string    // e.g. "Sharper Hook"
  approach: string // One sentence: what specifically changed and why
  content: string  // The full rewritten post
}

export interface RewriteResult {
  versions: RewriteVersion[]
}

export interface RewriteError {
  error: string
}
