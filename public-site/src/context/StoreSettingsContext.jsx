import { createContext, useContext, useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const defaultSettings = {
  store_name: 'Arogya Paadhai',
  email: 'aarokiyapaathai@gmail.com',
  phone: '+91 82201 28785',
  whatsapp: '+91 82201 28785',
  whatsapp_channel: 'https://whatsapp.com/channel/0029Vb81pg04IBhIymkvd53h',
  whatsapp_community: 'https://chat.whatsapp.com/D0KEeEUAWiG5FAiS76yST7',
  instagram: 'https://www.instagram.com/aarogya_paadhai?igsh=MWUxaWdpbnJqMTZlcw==',
  address: 'Krishnagiri, Tamil Nadu, India',
  business_hours: 'Mon - Sat: 7:00 AM - 8:00 PM',
  google_review_link: 'https://maps.app.goo.gl/gKjrZUMHv4RZhiA98',
};

const StoreSettingsContext = createContext(defaultSettings);

export function StoreSettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    fetch(`${API}/settings/store`)
      .then(r => r.json())
      .then(data => {
        if (data && data.store_name) setSettings(data);
      })
      .catch(() => {});
  }, []);

  return (
    <StoreSettingsContext.Provider value={settings}>
      {children}
    </StoreSettingsContext.Provider>
  );
}

export function useStoreSettings() {
  return useContext(StoreSettingsContext);
}
