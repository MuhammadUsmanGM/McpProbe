import clipboardy from 'clipboardy';

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    clipboardy.writeSync(text);
    return true;
  } catch {
    return false;
  }
}
