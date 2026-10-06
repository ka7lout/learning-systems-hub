# ISMAILI HARVARD LEARNING SCIENCE (IHLS)
## Empirical Foundations & Operational Protocols

---

## 1. Core Learning-Science Principles

IHLS synthesizes findings from cognitive psychology, educational neuroscience, and university-level active pedagogy (Dunlosky et al., 2013; Cepeda et al., 2006; Harvard Bok Center Active Learning Framework):

1. **Active Retrieval Practice over Passive Review:**
   - Testing/retrieval induces memory consolidation far superior to re-reading or lecture-watching.
   - Every substantive concept mandates a prompt to retrieve from memory before solutions or notes are viewed.

2. **State-Adaptive Cognitive Load Management:**
   - Learners vary across operational states:
     - `Deep`: High cognitive bandwidth; long synthesis units, complex derivations, high autonomy.
     - `Drift`: Diminishing attentional hold; single-concept atomization, immediate verification loop.
     - `Fog`: High initiation friction; low-friction micro-recalls, worked examples with fading support.
     - `Overload`: High cognitive load; segmenting, worked-out steps, reducing simultaneous variables.
   - *Ethical Guardrail:* This is operational pacing, never a clinical/medical diagnosis.

3. **Spaced & Interleaved Scheduling:**
   - Modified SM-2 SuperMemo algorithm factoring in item difficulty, delayed recall scores, error classification, and transfer performance.
   - Interleaving prevents formulaic problem-solving by mixing problem categories (e.g., optimization vs. integration vs. classification).

4. **Transfer Engine & Case-Based Reasoning (Harvard Case Method Adaptation):**
   - Stage 1: Retrieval (Can you recall the concept?)
   - Stage 2: Application (Can you apply it to standard examples?)
   - Stage 3: Transfer (Can you solve an unseen problem with novel constraints/noise?)
   - Stage 4: Engineering Case (Can you defend technical trade-offs with incomplete data?)

5. **AI Tutor as Socratic Scaffold, Not Cognitive Substitute:**
   - Default interaction pattern: `Question → Student Attempt → Diagnose → Smallest Useful Hint → Second Attempt → Explanation → Transfer Problem`.
   - AI Dependency Detector triggers oral viva or code prediction if passive copy-pasting is observed.

6. **Anti-Compulsion & Verification Guardrails:**
   - Prevents endless reassurance loops (e.g. asking AI 5 times if code is 100% perfect).
   - Once evidence threshold is reached, directs student immediately to empirical testing or execution.

7. **Notebook Structure Contract:**
   - `MUST WRITE`: Hand-written / explicitly codified mental models, key invariants, failure modes, self-explanation.
   - `RECOMMENDED`: Implementation details and optional extensions.
   - `OPTIONAL`: Full API specs / reference docs.

---

## 2. Research Hypotheses Under Evaluation

- **H1 (State Adaptation):** Dynamic adjustment of task granularity based on user-reported state improves weekly study consistency and reduces drop-off compared to rigid time blocks (e.g., static Pomodoro).
- **H2 (Mandatory Attempt Rule):** Requiring an initial student hypothesis before AI hint exposure produces significantly higher retention in delayed transfer evaluations.
- **H3 (Multi-level Transfer):** Layered evaluation (recall → debugging → case decision → oral defense) yields superior engineering debugging performance over code-completion alone.
