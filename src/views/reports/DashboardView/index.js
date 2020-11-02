import React from 'react';
import {
  Container,
  Grid,
  makeStyles
} from '@material-ui/core';
import { subscribe } from 'mqtt-react';
import Page from 'src/components/Page';
import Budget from './Budget';
import ListLoads from './ListLoads';
import LoadDistribution from './LoadDistribution';
import TasksProgress from './TasksProgress';
import TotalCustomers from './TotalCustomers';
import TotalProfit from './TotalProfit';
import SystemHealth from './SystemHealth';
import NumberWidget from './NumberWidget';
import MyMap from './MyMap';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3)
  }
}));

const Dashboard = ({ data }) => {
  const initFreq = 50;
  const initAverageVoltage = 218;
  const classes = useStyles();
  const [totalConsumption, setTotalConsumption] = React.useState(0);
  const [totalProduced, setTotalProduced] = React.useState(100);
  const [freq, setFreq] = React.useState(initFreq);
  const [averageVoltage, setAverageVoltage] = React.useState(initAverageVoltage);
  const [loads, setLoads] = React.useState([
    ['Tulkarm', 32.312924, 35.04662, true, 28],
    ['Deir Ghusoon', 32.3534804, 35.0832078, true, 19],
    ['Qufeen', 32.43335, 35.083525, true, 14],
    ['Illar', 32.370086, 35.107486, false, 18],
    ['Anbta', 32.3081, 35.1186, true, 23],
    ['Balaa', 32.333167, 35.108653, true, 22],
    ['Faraoun', 32.285942, 35.022931, false, 12]]);

  const maxPower = 130;
  const handleLoadClicked = (i) => {
    const tmpLoads = loads;
    tmpLoads[i][3] = !tmpLoads[i][3];
    setLoads([...tmpLoads]);
  };
  React.useEffect(() => {
    let acc = 0;
    loads.map((load) => {
      if (load[3]) {
        acc += load[4];
      }
    });
    setTotalConsumption(acc);
    const tp = (acc <= maxPower) ? acc : maxPower;
    setTotalProduced(tp);
    setFreq(initFreq * tp / acc);
  }, [loads]);

  React.useEffect(() => {
    if (data.length > 0) {
      const message = data[0];
      if (message.hasOwnProperty('freq')) {
        setFreq(parseFloat(message.freq));
      }
    }
  }, [data]);
  React.useEffect(()=>{
    console.log("freq", freq)
  },[freq])
  React.useEffect(() => {
    let acc = 0;
    loads.map((load) => {
      if (load[3]) {
        acc += load[4];
      }
    });
    setTotalConsumption(acc);
    const tp = (acc <= maxPower) ? acc : maxPower;
    setTotalProduced(tp);
    setFreq(initFreq * tp / acc);
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
            <NumberWidget name="Frequency" value={freq} isChart unit="Hz" yellowFrom={48} yellowTo={48.5} redFrom={47} redTo={48} min={47} max={54} />
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
            <NumberWidget name="Produced Power" value={totalProduced} isChart unit="KW" yellowFrom={maxPower - 30} yellowTo={maxPower - 15} redFrom={maxPower - 15} redTo={maxPower} min={0} max={maxPower} />
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
          <Grid
            item
            lg={8}
            md={12}
            xl={9}
            xs={12}
          >
            {loads.length > 0 && (<LoadDistribution loadslist={loads} handleLoadClicked={handleLoadClicked} />)}
          </Grid>
          <Grid
            item
            lg={4}
            md={6}
            xl={3}
            xs={12}
          >
            <SystemHealth />
          </Grid>
          <Grid
            item
            lg={4}
            md={6}
            xl={3}
            xs={12}
          />
          <Grid
            item
            lg={8}
            md={12}
            xl={9}
            xs={12}
          >
            <ListLoads loads={loads} averageVoltage={averageVoltage} />
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
};

export default subscribe({
  topic: 'presence'
})(Dashboard);
