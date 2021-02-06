

export const log = (subject: string, args: Record<string, unknown>): void => {
  console.group(`%c${subject}`, 'color: blue; background-color: #FFFFCC;');
  console.log(args);
  console.groupEnd();
};

