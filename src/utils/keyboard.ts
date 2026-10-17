import type { KeyboardEvent } from "react";

// Tabs and radio choices share the same roving keyboard interaction.
export function handleChoiceKeys(event: KeyboardEvent<HTMLElement>) {
  const choices = Array.from(
    event.currentTarget.querySelectorAll<HTMLButtonElement>(
      '[role="tab"]:not(:disabled), [role="radio"]:not(:disabled)',
    ),
  );
  const current = choices.indexOf(document.activeElement as HTMLButtonElement);
  if (current < 0 || !choices.length) return;
  let next = current;
  if (event.key === "ArrowRight" || event.key === "ArrowDown")
    next = (current + 1) % choices.length;
  else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
    next = (current - 1 + choices.length) % choices.length;
  else if (event.key === "Home") next = 0;
  else if (event.key === "End") next = choices.length - 1;
  else return;
  event.preventDefault();
  choices[next].focus();
  choices[next].click();
}
