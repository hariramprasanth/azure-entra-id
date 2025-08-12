import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { useMsal, AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import { loginRequest } from "./authConfig";

function GraphUserInfo({ accessToken }) {
  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    const res = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const data = await res.json();
    setUser(data);
  };

  if (!user) {
    return <button onClick={fetchUser}>Get User Info</button>;
  }
  return (
    <div>
      <h3>User Info</h3>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}

function App() {
  const [count, setCount] = useState(0)
  const { instance, accounts } = useMsal();
  const [accessToken, setAccessToken] = useState(null);

  const handleLogin = () => {
    instance.loginPopup(loginRequest).then(() => {
      instance.acquireTokenSilent({ ...loginRequest, account: instance.getActiveAccount() || accounts[0] })
        .then(response => setAccessToken(response.accessToken));
    });
  };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <AuthenticatedTemplate>
        <div>
          <p>Logged in as {accounts[0]?.username}</p>
          {accessToken && <GraphUserInfo accessToken={accessToken} />}
        </div>
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <button onClick={handleLogin}>Login with Azure Entra ID</button>
      </UnauthenticatedTemplate>
    </>
  )
}

export default App
