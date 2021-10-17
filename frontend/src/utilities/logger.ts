
export const log = (subject: string, args: Record<string, unknown>): void => {
  const date = new Date().toLocaleString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3, timeZoneName: 'short'
  } as Intl.DateTimeFormatOptions);
  console.group(`%c${subject} %c @ ${date}`, 'color: blue; background-color: #FFFFCC;', 'color: #999;');
  if (args != null && args != {}) console.log(args);
  console.groupEnd();
};

