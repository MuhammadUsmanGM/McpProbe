// ora is ESM-only, so we use dynamic import
let oraModule: any = null;

async function getOra() {
  if (!oraModule) {
    oraModule = await import('ora');
  }
  return oraModule.default;
}

export interface SpinnerInstance {
  start: (text?: string) => void;
  succeed: (text?: string) => void;
  fail: (text?: string) => void;
  warn: (text?: string) => void;
  stop: () => void;
}

export async function createSpinner(text: string): Promise<SpinnerInstance> {
  const ora = await getOra();
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
