import 'react-perfect-scrollbar/dist/css/styles.css';
import React, { useContext, useEffect, useState } from 'react';
import { useRoutes } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/core';
import GlobalStyles from 'src/components/GlobalStyles';
import 'src/mixins/chartjs';
import theme from 'src/theme';
import routes from 'src/routes';
import { Connector } from 'mqtt-react';
import CircularProgress from '@material-ui/core/CircularProgress';
import LoginView from './views/auth/LoginView';
import UserProvider, { UserContext } from './providers/UserProvider';
import { auth } from './firebase';

const App = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const routing = useRoutes(routes);
  useEffect(() => {
    auth.onAuthStateChanged(() => {
      setIsInitialized(true);
    });
  }, []);
  return (
    <UserProvider>
      <Connector mqttProps="wss://ip-160-153-252-170.ip.secureserver.net:8888">
        <ThemeProvider theme={theme}>
          <GlobalStyles />
          { isInitialized ? auth.currentUser ? routing : <LoginView /> : <CircularProgress /> }
        </ThemeProvider>
      </Connector>
    </UserProvider>
  );
};

export default App;
