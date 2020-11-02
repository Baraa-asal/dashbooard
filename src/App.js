import 'react-perfect-scrollbar/dist/css/styles.css';
import React from 'react';
import { useRoutes } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/core';
import GlobalStyles from 'src/components/GlobalStyles';
import 'src/mixins/chartjs';
import theme from 'src/theme';
import routes from 'src/routes';
import { Connector } from 'mqtt-react';

const App = () => {
  const routing = useRoutes(routes);

  return (
    <Connector mqttProps="ws://mqtt-broker-server-baraa.herokuapp.com/">
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        {routing}
      </ThemeProvider>
    </Connector>
  );
};

export default App;
