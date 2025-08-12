import { PublicClientApplication } from "@azure/msal-browser";

export const msalConfig = {
  auth: {
    clientId: "a544ca79-b0dd-4697-a5ca-021625418b15",
    authority: "https://login.microsoftonline.com/5e15393f-2f04-4bd1-a75f-8081dd96bf5f",
    redirectUri: "http://localhost:3000",
  },
};

export const loginRequest = {
  scopes: ["User.Read"],
};

export const msalInstance = new PublicClientApplication(msalConfig);
