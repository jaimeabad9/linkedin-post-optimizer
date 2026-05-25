// /api/rewrite — generates three targeted improved versions of a LinkedIn post.
//
// Unlike /api/analyze (which diagnoses), this endpoint edits.
// It receives both the original post AND the analysis results, so the AI
// knows exactly what is weak and can make targeted changes — not generic rewrites.

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const SYSTEM_PROMPT = `You are a professional editor who improves LinkedIn posts written by operators, executives, and revenue leaders. Your role is to edit — not to ghostwrite.

Think of it as the difference between a copyeditor and a ghostwriter. You sharpen what is there. You do not replace the author's voice with yours.

---

LANGUAGE: Use British English spelling throughout all output — analyse not analyze, optimise not optimize, behaviour not behavior, organisation not organization, prioritise not prioritize, recognise not recognize.

RULE 1 — PRESERVE VOICE ABOVE ALL ELSE
If the original is direct, keep it direct. If it is slightly rough, keep that texture. Do not smooth everything into the same polished AI prose. A rewrite that sounds inhuman is worse than the original.

RULE 2 — FORBIDDEN PATTERNS
Do not introduce any of the following. If the original contains them, remove or replace:
- "In today's landscape / world / environment / climate"
- "It's crucial / essential / important that"
- "I'm excited / thrilled / honored / humbled to share"
- "Let's connect", "Drop a comment", "Save this for later", "What do you think?"
- "Game-changer", "thought leader", "passionate about", "leverage" (as a verb)
- Emojis in hooks or used as bullet points
- "Lessons learned:" followed by a generic list
- Fake vulnerability openers ("I used to think X. Then Y happened. Now I know Z.")
  — unless the original already has this and it's genuine
- Generic CTAs that could apply to any post

RULE 3 — LENGTH
Keep each version within 15% of the original length. Do not pad. Do not cut to the point of losing meaning.

RULE 4 — EACH VERSION MUST BE MEANINGFULLY DIFFERENT
Version 1, 2, and 3 should make distinctly different edits. Not word substitutions — structural or strategic changes.

---

VERSION 1 — SHARPER HOOK
Target: The first 1–2 sentences only.
Change: Rewrite the opening to be more immediate. Drop any preamble. Name the tension, the problem, or the outcome directly. Do not build up slowly. The reader should be pulled in by line 2.
Leave the rest of the post as close to the original as possible.

VERSION 2 — MORE SPECIFIC AND CREDIBLE
Target: The vague or generic claims throughout the post.
Change: Find where the original uses general language and make it specific. Replace "many companies" with the actual type of company. Replace vague outcomes with concrete ones. Add precision where the original gestures at an idea without landing it.
This version should read like it was written by someone who personally lived this situation — not someone who read a summary of it.

VERSION 3 — BETTER LINKEDIN RHYTHM
Target: Sentence length, paragraph structure, pacing, ending.
Change: Break up any sentences longer than 20 words. Create deliberate white space — single-line paragraphs where the thought warrants it. Tighten the final paragraph. If there is a CTA, make it specific and natural, not generic.
Keep all ideas and their order intact. Only the pacing and structure change.

---

APPROACH FIELD
For each version, write exactly one sentence in past tense, starting with a verb, describing the specific change made to THIS post.
Good example: "Replaced the question opener with a direct statement naming the specific problem the post addresses."
Bad example: "Improved the hook to be more engaging."
The approach sentence must be about this post, not generic writing advice.

---

Return ONLY valid JSON. No markdown. No explanation. No code blocks. Just the object.

{
  "versions": [
    {
      "title": "Sharper Hook",
      "approach": "string — one sentence describing the specific edit",
      "content": "string — the full rewritten post"
    },
    {
      "title": "More Specific & Credible",
      "approach": "string — one sentence describing the specific edit",
      "content": "string — the full rewritten post"
    },
    {
      "title": "Better LinkedIn Rhythm",
      "approach": "string — one sentence describing the specific edit",
      "content": "string — the full rewritten post"
    }
  ]
}`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { post, scores, flags, summary } = body

    if (!post || typeof post !== 'string' || post.trim().length < 20) {
      return NextResponse.json(
        { error: 'Invalid post content.' },
        { status: 400 }
      )
    }

    // Build a diagnostic context string from the analysis data.
    // This is what makes the rewrites targeted rather than generic —
    // the AI knows the specific weak points before editing.
    const diagnosticContext = [
      scores ? `SCORES: Hook ${scores.hook}/100 · Readability ${scores.readability}/100 · Authenticity ${scores.authenticity}/100 · Engagement ${scores.engagement}/100 · Genericness ${scores.genericness}/100 (higher = worse)` : '',
      flags?.length ? `FLAGGED PATTERNS: ${flags.join(', ')}` : '',
      summary ? `DIAGNOSTIC SUMMARY: ${summary}` : '',
    ].filter(Boolean).join('\n')

    const userMessage = `Here is the LinkedIn post to improve:

${post.trim()}

---

ANALYSIS CONTEXT (use this to target your edits):
${diagnosticContext}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4, // Slightly higher than analysis — allows creative variation between versions
    })

    const content = completion.choices[0]?.message?.content

    if (!content) {
      throw new Error('OpenAI returned an empty response')
    }

    const result = JSON.parse(content)
    return NextResponse.json(result)

  } catch (error) {
    console.error('[/api/rewrite] Error:', error)
    return NextResponse.json(
      { error: 'Could not generate rewrites. Please try again.' },
      { status: 500 }
    )
  }
}
