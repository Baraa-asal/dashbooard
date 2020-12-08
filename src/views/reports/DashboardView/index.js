import React, { useState } from 'react';
import {
  Container,
  Grid,
  makeStyles
} from '@material-ui/core';
import { subscribe } from 'mqtt-react';
import Page from 'src/components/Page';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import Budget from './Budget';
import ListLoads from './ListLoads';
import LoadDistribution from './LoadDistribution';
import TasksProgress from './TasksProgress';
import TotalCustomers from './TotalCustomers';
import TotalProfit from './TotalProfit';
import SystemHealth from './SystemHealth';
import NumberWidget from './NumberWidget';
import MyMap from './MyMap';
import ListSources from './ListSources';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  }
}));

const Dashboard = ({ data, mqtt }) => {
  const initFreq = 59;
  const initAverageVoltage = 218;
  const classes = useStyles();
  const [errorMsg, setErrorMsg] = React.useState('');
  const [warningMsg, setWarningMsg] = React.useState('');
  const [infoMsg, setInfoMsg] = React.useState('');
  const [totalConsumption, setTotalConsumption] = React.useState(0);
  const [totalProduced, setTotalProduced] = React.useState(100);
  const [freq, setFreq] = React.useState(initFreq);
  const [averageVoltage, setAverageVoltage] = React.useState(initAverageVoltage);

  const [loads, setLoads] = React.useState([
    ['Tulkarm', 32.312924, 35.04662, true, 28, 0],
    ['Deir Ghusoon', 32.3534804, 35.0832078, true, 19, 0],
    ['Qufeen', 32.43335, 35.083525, true, 14, 0],
    ['Illar', 32.370086, 35.107486, false, 18, 0],
    ['Anbta', 32.3081, 35.1186, true, 23, 0],
    ['Balaa', 32.333167, 35.108653, true, 22, 0],
    ['Faraoun', 32.285942, 35.022931, false, 12, 0]]);
  const [generators, setGenerators] = React.useState([
    ['First Generator', 32.312924, 35.04662, true, 50],
    ['First Generator', 32.3534804, 35.0832078, true, 30],
    ['Third Generator', 32.43335, 35.083525, true, 26]]);

  const [maxPower, setMaxPower] = useState(130);
  const handleLoadClicked = (i) => {
    const tmpLoads = loads;
    tmpLoads[i][3] = !tmpLoads[i][3];
    setLoads([...tmpLoads]);
    const msg = { id: tmpLoads[i][0], state: tmpLoads[i][3] };
    mqtt.publish('loads-control', JSON.stringify(msg));
  };
  React.useEffect(() => {
    let acc = 0;
    loads.map((load) => {
      if (load[3]) {
        acc += load[4];
      }
    });
    setTotalConsumption(acc);
  }, [loads]);
  mqtt.on('message', ((topic, message) => {
    const msg = JSON.parse(message.toString());
    if (topic === 'system-update') {
      const frequency = parseFloat(msg?.systemState?.freq || 59);
      setFreq(frequency);
      // eslint-disable-next-line max-len
      const tmpGenerators = msg?.generators?.Generators?.length ? msg?.generators?.Generators[0] : [];
      setGenerators(tmpGenerators);
      if (tmpGenerators && tmpGenerators.length) {
        let accProducedPower = 0;
        for (let i = 0; i < tmpGenerators.length; i++) {
          accProducedPower += parseFloat(tmpGenerators[i].PowerG);
        }
        accProducedPower = parseFloat(accProducedPower.toFixed(2));
        setMaxPower(accProducedPower * 1.5);
        setTotalProduced(accProducedPower);
      }
    }
  }));
  React.useEffect(() => {
    // console.log(data);
    for (let i = 0; i < data.length; i++) {
      // console.log(data[i]);
    }
    if (data && data.length > 0) {
      const message = data[0];
      // console.log(message, message.hasOwnProperty('id'));
      if (message.hasOwnProperty('id')) {
        const tmpLoads = loads;
        for (let i = 0; i < loads.length; i++) {
          //   console.log(message, message.state === 'true', tmpLoads[i][0] === message.id);
          if (tmpLoads[i][0] === message.id) {
            if (message.hasOwnProperty('state') && (message.state === 'true') !== tmpLoads[i][3]) {
              tmpLoads[i][3] = (message.state === 'true');
              setLoads([...tmpLoads]);
            }
            if (message.hasOwnProperty('current') && parseFloat(message.current) !== tmpLoads[i][5]) {
              tmpLoads[i][5] = parseFloat(message.current);
              setLoads([...tmpLoads]);
            }
          }
        }
      }
      if (message.hasOwnProperty('systemData')) {
        if (message.systemData.hasOwnProperty('freq')) {
          setFreq(parseFloat(message.systemData.freq));
        }
        if (message.systemData.hasOwnProperty('voltage')) {
          setAverageVoltage(parseFloat(message.systemData.voltage));
        }
        if (message.systemData.hasOwnProperty('producedPower')) {
          setTotalProduced(parseFloat(message.systemData.producedPower));
        }
      }
      if (message.hasOwnProperty('loads')) {
        setLoads(message.loads);
      }
      if (message.hasOwnProperty('alert')) {
        if (message.alert.hasOwnProperty('errorMsg')) {
          setErrorMsg(message.alert.errorMsg);
        }
        if (message.alert.hasOwnProperty('warningMsg')) {
          setWarningMsg(message.alert.warningMsg);
        }
        if (message.alert.hasOwnProperty('infoMsg')) {
          setInfoMsg(message.alert.infoMsg);
        }
      }
    }
  }, [data]);
  React.useEffect(() => {
    console.log('freq', freq);
  }, [freq]);
  React.useEffect(() => {
    let acc = 0;
    loads.map((load) => {
      if (load[3]) {
        acc += load[4];
      }
    });
    setTotalConsumption(acc);
  }, []);
  return (
    <Page
      className={classes.root}
      title="Dashboard"
    >
      <Container maxWidth={false}>
        <Grid
          container
          spacing={3}
        >
          <Grid
            item
            lg={3}
            sm={6}
            xl={3}
            xs={12}
          >
            <NumberWidget name="Frequency" value={freq} isChart unit="Hz" yellowFrom={58} yellowTo={58.5} redFrom={57} redTo={58} min={57} max={65} />
          </Grid>
          <Grid
            item
            lg={3}
            sm={6}
            xl={3}
            xs={12}
          >
            <NumberWidget name="Average Voltage" value={averageVoltage} isChart unit="voltage" yellowFrom={240} yellowTo={270} redFrom={270} redTo={300} min={0} max={300} />
          </Grid>
          <Grid
            item
            lg={3}
            sm={6}
            xl={3}
            xs={12}
          >
            <NumberWidget name="Produced Power" value={totalProduced} isChart unit="MW" yellowFrom={maxPower - 30} yellowTo={maxPower - 15} redFrom={maxPower - 15} redTo={maxPower} min={0} max={maxPower} />
          </Grid>
          <Grid
            item
            lg={3}
            sm={6}
            xl={3}
            xs={12}
          >
            <NumberWidget name="Consumed Power" value={totalConsumption} isChart unit="KW" yellowFrom={maxPower - 30} yellowTo={maxPower - 15} redFrom={maxPower - 15} redTo={maxPower} min={0} max={maxPower} />
          </Grid>
          {
            ((errorMsg && errorMsg.length > 0)
              || (warningMsg && warningMsg.length > 0)
             || (infoMsg && infoMsg.length > 0))
            && (
            <Grid
              item
              lg={12}
              md={12}
              xl={12}
              xs={12}
            >
              {(errorMsg && errorMsg.length > 0) && (
              <Alert onClose={() => { setErrorMsg(''); }} variant="filled" severity="error">
                <AlertTitle>Error</AlertTitle>
                {errorMsg}
              </Alert>
              )}
              {(warningMsg && warningMsg.length > 0) && (
              <Alert onClose={() => { setWarningMsg(''); }} severity="warning">
                <AlertTitle>Warning</AlertTitle>
                {warningMsg}
              </Alert>
              )}
              {(infoMsg && infoMsg.length > 0) && (
              <Alert onClose={() => { setInfoMsg(''); }} severity="info">
                <AlertTitle>Info</AlertTitle>
                {infoMsg}
              </Alert>
              )}
            </Grid>
            )
}
          <Grid
            item
            lg={12}
            md={12}
            xl={12}
            xs={12}
          >
            {loads.length > 0
            && (
            <LoadDistribution
              loadslist={loads}
              handleLoadClicked={handleLoadClicked}
            />
            )}
          </Grid>
          <Grid
            item
            lg={12}
            md={12}
            xl={12}
            xs={12}
          >
            <ListSources sources={generators} averageVoltage={averageVoltage} freq={freq} />
          </Grid>
          <Grid
            item
            lg={12}
            md={12}
            xl={12}
            xs={12}
          >
            <ListLoads
              handleLoadClicked={handleLoadClicked}
              loads={loads}
              averageVoltage={averageVoltage}
            />
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
};

export default subscribe({
  topic: ['loads-updates', 'system-update']
})(Dashboard);
