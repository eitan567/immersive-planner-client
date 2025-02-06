export type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;
export type TextAreaChangeEvent = React.ChangeEvent<HTMLTextAreaElement>;
export type FormInputEvent = InputChangeEvent | TextAreaChangeEvent;

// Helper type guard
export const isInputElement = (target: EventTarget): target is HTMLInputElement => {
  return target instanceof HTMLInputElement;
};

export const isTextAreaElement = (target: EventTarget): target is HTMLTextAreaElement => {
  return target instanceof HTMLTextAreaElement;
};

export const getInputValue = (e: FormInputEvent): string => {
  if (isInputElement(e.target) || isTextAreaElement(e.target)) {
    return e.target.value;
  }
  return '';
};