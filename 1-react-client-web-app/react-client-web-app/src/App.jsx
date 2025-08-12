import { useState } from "react";
import {
  useMsal,
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
} from "@azure/msal-react";
import { loginRequest } from "./authConfig";

// Helper to decode JWT
function decodeJwt(token) {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

function TokenDisplay({ accessToken, idToken }) {
  const decodedAccess = decodeJwt(accessToken);
  const decodedId = decodeJwt(idToken);

  return (
    <div>
      <h2>Access Token</h2>
      <textarea
        readOnly
        rows={4}
        style={{ width: "100%" }}
        value={accessToken}
      />
      <h3>Decoded Access Token</h3>
      <pre>{JSON.stringify(decodedAccess, null, 2)}</pre>
      <h2>ID Token</h2>
      <textarea readOnly rows={4} style={{ width: "100%" }} value={idToken} />
      <h3>Decoded ID Token</h3>
      <pre>{JSON.stringify(decodedId, null, 2)}</pre>
    </div>
  );
}

function UserInfo({ accessToken }) {
  const [user, setUser] = useState(null);
  const curlCmd = `curl -H "Authorization: Bearer ${accessToken}" https://graph.microsoft.com/v1.0/me`;

  const copyCurl = () => {
    navigator.clipboard.writeText(curlCmd);
  };

  const fetchUser = async () => {
    const res = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    setUser(data);
  };

  // Fetch user info when accessToken changes
  useState(() => {
    if (accessToken) fetchUser();
  }, [accessToken]);

  if (!user) return <div>Loading user info...</div>;
  return (
    <div>
      <h2>User Details</h2>
      <p>
        <strong>Name:</strong> {user.displayName}
      </p>
      <p>
        <strong>Email:</strong> {user.mail || user.userPrincipalName}
      </p>
      <h3>Graph API Call (curl)</h3>
      <pre>{curlCmd}</pre>
      <button onClick={copyCurl}>Copy to clipboard</button>
    </div>
  );
}

function App() {
  const { instance, accounts } = useMsal();
  const [accessToken, setAccessToken] = useState(null);
  const [idToken, setIdToken] = useState(null);

  const handleLogin = async () => {
    // Login and get ID token
    const loginResponse = await instance.loginPopup(loginRequest);
    setIdToken(loginResponse.idToken);

    // Try to get access token silently
    try {
      const tokenResponse = await instance.acquireTokenSilent({
        ...loginRequest,
        account: loginResponse.account,
      });
      setAccessToken(tokenResponse.accessToken);
    } catch (e) {
      // If silent fails, fallback to popup
      const tokenResponse = await instance.acquireTokenPopup({
        ...loginRequest,
        account: loginResponse.account,
      });
      setAccessToken(tokenResponse.accessToken);
    }
  };

  const handleLogout = () => {
    setAccessToken(null);
    setIdToken(null);
    instance.logoutPopup();
  };

  return (
    <>
      <AuthenticatedTemplate>
        <button onClick={handleLogout} style={{ float: "right" }}>
          Logout
        </button>
        <TokenDisplay accessToken={accessToken} idToken={idToken} />
        {accessToken && <UserInfo accessToken={accessToken} />}
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <button onClick={handleLogin}>Login with Azure Entra ID</button>
      </UnauthenticatedTemplate>
    </>
  );
}

export default App;
