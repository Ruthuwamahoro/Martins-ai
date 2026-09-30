/**
 * The way Martins AI talks.
 *
 * Applying for a scholarship is stressful, and most people do it alone at
 * night after a full day. Every string that a student reads should sound like
 * a kind, competent friend: plain words, no pressure, no scolding, and always
 * a next step that feels small enough to do today.
 *
 * Keep the copy here (not scattered in components) so the voice stays
 * consistent and is easy to translate into Kinyarwanda, French or Swahili.
 */
import type { Outcome, Person, Scholarship } from "./types";
import { addDays, firstName, formatDate } from "./utils";

export function greeting(name: string, now = new Date()) {
  const h = now.getHours();
  const part =
    h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  return `${part}, ${firstName(name)}`;
}

export function todayLine(
  activeCount: number,
  soonest?: { name: string; days: number },
) {
  if (activeCount === 0)
    return "Nothing in progress yet. Pick one scholarship that feels possible and start there. One is enough.";
  if (soonest && soonest.days <= 14)
    return `${soonest.name} closes in ${soonest.days} day${soonest.days === 1 ? "" : "s"}. You don't have to finish today. Just take the next small step.`;
  return `You have ${activeCount} application${activeCount === 1 ? "" : "s"} moving. Steady beats fast.`;
}

export const empty = {
  applications: {
    title: "Nothing here yet",
    body: "When you save a scholarship or start an application, it will wait for you here.",
  },
  writing: {
    title: "Your stories live here",
    body: "Start with the one only you can tell. You can adapt it for every application later, and it will always be here when you come back.",
  },
  people: {
    title: "Nobody applies alone",
    body: "Add the lecturers, managers and mentors who know your work. We'll help you ask them kindly, and remember to thank them.",
  },
};

export const writingPrompts = [
  {
    title: "Why this matters to me",
    hint: "Start with a moment, not a summary. What did you see, and what did you do?",
  },
  {
    title: "A challenge I got through",
    hint: "Be honest about how hard it was. Readers trust honesty more than polish.",
  },
  {
    title: "What I'll do when I come back",
    hint: "Be specific: who will you help, and what will change?",
  },
];

export function outcomeMessage(outcome: Outcome, scholarship: string) {
  switch (outcome) {
    case "awarded":
      return {
        title: "Congratulations. You earned this.",
        body: `${scholarship} chose you. Take a moment to enjoy it. And before the celebration ends, thank the people who wrote for you and read your drafts. They'll want to know.`,
      };
    case "not_selected":
      return {
        title: "This one wasn't yours.",
        body: "That's about limited places, not your worth. Everything you wrote is still saved, and the next essay will start from a stronger place than this one did. Take a day, then come back.",
      };
    case "withdrawn":
      return {
        title: "Stepping back is a real choice.",
        body: "Your notes and your essay are still here if you change your mind, or if a different scholarship feels more like you.",
      };
  }
}

export const communityTips = [
  {
    from: "Sample tip from a past applicant",
    text: "I asked my referees five weeks before the deadline. Two of them said yes the same day. Asking early is a kindness to them, too.",
  },
  {
    from: "Sample tip from a past applicant",
    text: "My first draft sounded like a brochure. The second sounded like me. I read it aloud to my sister and fixed every sentence I stumbled on.",
  },
  {
    from: "Sample tip from a past applicant",
    text: "I kept a folder of small wins: a thank-you note, a certificate, a message from a patient. It was easier to write about my work when I could see it.",
  },
  {
    from: "Sample tip from a past applicant",
    text: "I asked a friend who doesn't know my field to read my essay. Where she got lost, the reviewers would have too.",
  },
];

// ---- Messages a student sends to real people ------------------------------

export function askForReferenceMessage(p: {
  person: Person;
  applicant: string;
  scholarship: Scholarship;
  why: string;
}) {
  const { person, applicant, scholarship, why } = p;
  const draftBy = formatDate(addDays(scholarship.deadline, -14));
  return {
    subject: `Would you be willing to write a reference for me?`,
    body: [
      `Dear ${firstName(person.name)},`,
      ``,
      `I hope you're well. I'm applying for the ${scholarship.name}, and I would be honoured if you would consider writing a reference for me.${person.canSpeakTo ? ` You ${person.canSpeakTo}, and I think you can speak to my work better than anyone.` : ""}`,
      ``,
      why.trim() ? `Why this matters to me: ${why.trim()}` : ``,
      why.trim() ? `` : ``,
      `The deadline is ${formatDate(scholarship.deadline)}, so a draft by ${draftBy} would be ideal. If this isn't a good time, please tell me. I'll understand completely. I'm happy to send my CV, my essay draft, or anything else that makes it easier.`,
      ``,
      `Thank you for considering it, whatever you decide.`,
      ``,
      `Warmly,`,
      applicant,
    ]
      .filter((l, i, arr) => !(l === `` && arr[i - 1] === ``))
      .join("\n"),
  };
}

export function askForFeedbackMessage(p: {
  person: Person;
  applicant: string;
  essayTitle: string;
  body: string;
}) {
  const { person, applicant, essayTitle, body } = p;
  return {
    subject: `Could you read something I wrote?`,
    body: [
      `Dear ${firstName(person.name)},`,
      ``,
      `I'm working on an essay called "${essayTitle}" for a scholarship application, and I would really value your honest eyes on it. Tell me where it drags, where it confuses you, and where it sounds least like me. You don't need to be gentle.`,
      ``,
      `Whenever you have time is fine. Even a few lines back would help.`,
      ``,
      `Thank you,`,
      applicant,
      ``,
      `---`,
      body.trim() || "(draft goes here)",
    ].join("\n"),
  };
}

export function thankYouMessage(p: {
  person: Person;
  applicant: string;
  scholarship: Scholarship;
  outcome?: Outcome;
}) {
  const { person, applicant, scholarship, outcome } = p;
  const news =
    outcome === "awarded"
      ? `I wanted you to be among the first to know that I was awarded the ${scholarship.name}.`
      : outcome === "not_selected"
        ? `I didn't get the ${scholarship.name} this time, but I wanted you to hear it from me, and to say thank you anyway.`
        : `I've finished my application for the ${scholarship.name}.`;
  return {
    subject: `Thank you`,
    body: [
      `Dear ${firstName(person.name)},`,
      ``,
      news,
      ``,
      `Your reference and your time meant a lot. Writing for someone is real work, and I don't take it for granted. I'll keep you posted on what comes next.`,
      ``,
      `With gratitude,`,
      applicant,
    ].join("\n"),
  };
}
