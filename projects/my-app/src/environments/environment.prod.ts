export const environment = {
  production: true,
  enableConsole: false, // Prod: console OFF by default
} satisfies { production: boolean; enableConsole: boolean; [key: string]: unknown };
