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
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        { isInitialized ? auth.currentUser ? (
          <Connector mqttProps={{
            host: 'localhost', port: 8888, username: 'feUser', password: 'Y=^j*kj7X3mnurXy&UJx7qJ'
          }}
          >
            {routing}
          </Connector>
        ) : <LoginView /> : <CircularProgress /> }
      </ThemeProvider>

    </UserProvider>
  );
};

export default App;
