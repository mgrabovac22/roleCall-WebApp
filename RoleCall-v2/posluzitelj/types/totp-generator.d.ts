declare module "totp-generator" {
    export const TOTP: {
      generate: (
        secret: string,
        options?: {
          digits?: number;
          algorithm?: "SHA-1" | "SHA-256" | "SHA-512";
          period?: number;
        }
      ) => {otp: string, expires: number};
    };
  }
  
  