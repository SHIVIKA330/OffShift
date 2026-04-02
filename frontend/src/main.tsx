import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import RiderApp from './rider/RiderApp.tsx'

function Root() {
  // Use hash-based routing: #rider shows Rider App, anything else shows Admin
  const getInitialView = () => {
    return window.location.hash === '#rider' ? 'rider' : 'admin';
  };

  const [view, setView] = useState<'admin' | 'rider'>(getInitialView);

  const switchTo = (target: 'admin' | 'rider') => {
    window.location.hash = target === 'rider' ? '#rider' : '';
    setView(target);
  };

  if (view === 'rider') {
    return <RiderApp onSwitchToAdmin={() => switchTo('admin')} />;
  }

  return <App onSwitchToRider={() => switchTo('rider')} />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
