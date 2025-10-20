declare module "sudo-prompt" {
  export interface SudoPromptOptions {
    name?: string;
    icns?: string;
    env?: Record<string, string>;
  }

  export type SudoPromptCallback = (
    error: Error | null,
    stdout: string,
    stderr: string
  ) => void;

  export const exec: (
    command: string,
    options: SudoPromptOptions,
    callback: SudoPromptCallback
  ) => void;

  const sudoPrompt: {
    exec: typeof exec;
  };

  export default sudoPrompt;
}
