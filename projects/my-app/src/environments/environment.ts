export const environment = {
  production: false,
  enableConsole: true,  // Dev: console ON by default
} satisfies { production: boolean; enableConsole: boolean; [key: string]: unknown };
