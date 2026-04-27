import ora from 'ora';

export interface SpinnerInstance {
  start: (text?: string) => void;
  succeed: (text?: string) => void;
  fail: (text?: string) => void;
  warn: (text?: string) => void;
  stop: () => void;
}

export function createSpinner(text: string): SpinnerInstance {
  const spinner = ora({ text, spinner: 'dots' });

  return {
    start: (t?: string) => {
      if (t) spinner.text = t;
      spinner.start();
    },
    succeed: (t?: string) => spinner.succeed(t),
    fail: (t?: string) => spinner.fail(t),
    warn: (t?: string) => spinner.warn(t),
    stop: () => spinner.stop(),
  };
}
