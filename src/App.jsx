import { useState } from 'react';
import { DataProvider } from './context/DataContext';
import HomeScreen from './screens/HomeScreen';
import SummaryScreen from './screens/SummaryScreen';
import CalendarScreen from './screens/CalendarScreen';
import PaycheckScreen from './screens/PaycheckScreen';
import SettingsScreen from './screens/SettingsScreen';
import TabBar from './components/TabBar';
import './App.css';

export default function App() {
  const [tab, setTab] = useState('home');

  return (
    <DataProvider>
      <div className="app">
        <div className="screen-wrap">
          {tab === 'home'     && <HomeScreen />}
          {tab === 'summary'  && <SummaryScreen />}
          {tab === 'calendar' && <CalendarScreen />}
          {tab === 'paycheck' && <PaycheckScreen />}
          {tab === 'settings' && <SettingsScreen />}
        </div>
        <TabBar active={tab} onChange={setTab} />
      </div>
    </DataProvider>
  );
}
