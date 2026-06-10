// humbleInquiry.js — reference guide shown during field visits: how to ask
// questions the "Humble Inquiry" way. Content from the Schindler SAO program.

import { el } from './utils.js';

export const HUMBLE_INQUIRY = {
  definition: 'Humble inquiry is the delicate art of getting someone to open up, of asking questions you don\'t know the answers to beforehand, of building a relationship based on curiosity and interest in the other person.',
  author: 'Edgar H. Schein',
  principles: [
    ['Use open-ended questions', 'Prevents the employee from going into a "defensive" mode.'],
    ['Choose neutral language', 'Essential to prevent unintended bias or the perception of blame.'],
    ['Encourage insight and context', 'Help the technician explore their own thought process so you understand their "contextual rationality".'],
    ['Clarify without pressure', 'A humble conversation is a dialogue, not an interrogation. Pressure kills the flow of information.'],
    ['Focus on processes, not individuals', 'Understand how the system set the person up for failure.'],
    ['Avoid assumptions', 'Don\'t enter the conversation with a "preconceived story" of what happened.'],
  ],
  fourDs: [
    ['DANGEROUS', 'What part of the work could go wrong or lead to injury or harm?'],
    ['DIFFERENT', 'In what ways is the task being done today different from the standard procedure or what\'s normally expected?'],
    ['DIFFICULT', 'Which part of this task do you find takes the most effort or concentration?'],
    ['DUMB', 'What in this task doesn\'t make sense or seem illogical to you?'],
  ],
  conversation: [
    ['Plan and prepare', 'Review the people, context and task. Think of 2–3 open questions to ask.'],
    ['Explain the context', 'Say clearly you\'re here to learn — not to audit, control, check or judge. Set a tone of collaboration and real curiosity.'],
    ['Appreciate the role', 'The experts are the ones doing the work; you want to learn from their experience. Acknowledge their contribution.'],
    ['Notes & permission', 'Avoid taking notes in early stages; ask permission first, explaining you want to capture insights so they aren\'t forgotten.'],
    ['Focus on the task, not the person', 'Be curious about the challenges of the task, keeping a calm conversation centered on the work.'],
    ['Be fully present', 'Listen actively, speak with intention, make eye contact. Don\'t interrupt, rush or check your phone while they talk.'],
  ],
  benefits: ['Focuses on learning', 'Does not influence the response', 'Does not establish prejudices', 'Builds a relationship'],
};

export function openHumbleInquiry() {
  document.getElementById('hiModal')?.remove();
  const hi = HUMBLE_INQUIRY;
  const modal = el('div', { id: 'hiModal', class: 'hi-modal', onClick: (e) => { if (e.target.id === 'hiModal') modal.remove(); } });
  modal.innerHTML = `
    <div class="hi-panel">
      <div class="hi-head">
        <h2>💬 Humble Inquiry — how to ask</h2>
        <button class="icon-btn" id="hiClose">✕</button>
      </div>
      <div class="hi-body">
        <blockquote class="hi-quote">“${hi.definition}”<cite>— ${hi.author}</cite></blockquote>

        <h3>Questioning principles</h3>
        <ul class="hi-list">${hi.principles.map(([t, d]) => `<li><b>${t}.</b> ${d}</li>`).join('')}</ul>

        <h3>The 4 D's — frame the conversation</h3>
        <div class="hi-4d">${hi.fourDs.map(([t, q]) => `<div class="hi-d"><span class="hi-d-tag">${t}</span><p>${q}</p></div>`).join('')}</div>

        <h3>The conversation</h3>
        <ul class="hi-list">${hi.conversation.map(([t, d]) => `<li><b>${t}.</b> ${d}</li>`).join('')}</ul>

        <h3>Why it works</h3>
        <div class="hi-benefits">${hi.benefits.map((b) => `<span class="chip">${b}</span>`).join('')}</div>
      </div>
    </div>`;
  document.body.append(modal);
  modal.querySelector('#hiClose').addEventListener('click', () => modal.remove());
  requestAnimationFrame(() => modal.classList.add('open'));
}
