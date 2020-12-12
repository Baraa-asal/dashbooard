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
import { firestore } from '../../../firebase';
import ListLoads from './ListLoads';
import LoadDistribution from './LoadDistribution';
import NumberWidget from './NumberWidget';

import ListSources from './ListSources';
import ListBusses from './ListBusses';

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

  const [loads, setLoads] = React.useState({});
  const [generators, setGenerators] = React.useState([]);
  const [loadBuses, setLoadBuses] = React.useState([]);

  const [maxPower, setMaxPower] = useState(130);
  const handleLoadClicked = (i) => {
    const tmpLoads = loads;
    tmpLoads[i].status = !tmpLoads[i].status;
    setLoads({ ...tmpLoads });
    const msg = { id: i, state: tmpLoads[i].status };
    mqtt.publish('loads-control', JSON.stringify(msg));
  };
  const mergeObjects = (target, source) => {
    Object.keys(source).map((key) => {
      target[key] = source[key];
    });
    return target;
  };
  const addOnMessage = (loads, setLoads, setLoadBuses, setGenerators, setMaxPower, setTotalProduced, setFreq) => {
    mqtt.on('message', ((topic, message) => {
      let msg = {};
      try {
        msg = JSON.parse(message.toString());
        console.log(msg);
      } catch (e) {
        console.log(e);
      }
      if (topic === 'loads-updates') {
        console.log(loads);
        if (msg?.id) {
          const tmpLoads = loads;
          if (tmpLoads && tmpLoads[msg?.id]) {
            tmpLoads[msg?.id].status = (msg.state == 'true');
            setLoads({ ...tmpLoads });
          }
        } else {
          const tmpLoads = loads;
          Object.keys(msg).map((loadBus) => {
            const busLoads = msg[loadBus][loadBus][0];
            busLoads.map((load) => {
              const id = load?.relaynames;
              const loadObj = {
                status: load?.relaystate == 'true',
                latestPowerReading: load?.ValueLoad,
                lastHB: new Date().getTime(),
              };
              if (tmpLoads[id]) {
                tmpLoads[id] = mergeObjects(tmpLoads[id], loadObj);
              }
            });
          });
          setLoads({ ...tmpLoads });
        }
      }
      if (topic === 'system-update') {
        const frequency = parseFloat(msg?.systemState?.freq || 59);
        setFreq(frequency);
        // eslint-disable-next-line max-len
        const generatorsUpdate = msg?.generators?.Generators?.length ? msg?.generators?.Generators[0] : [];
        const tmpLoadBuses = msg?.LoadBusses?.length ? msg?.LoadBusses[0] : [];

        setLoadBuses(tmpLoadBuses);
        if (generatorsUpdate && generatorsUpdate.length) {
          let accProducedPower = 0;
          for (let i = 0; i < generatorsUpdate.length; i++) {
            accProducedPower += parseFloat(generatorsUpdate[i].PowerG);
            // eslint-disable-next-line max-len
            const filteredGenerators = generators.filter((gen) => { return gen.VBGnames == generatorsUpdate[i].VBGnames; });
            if (filteredGenerators.length) {
              const generator = filteredGenerators[0];

              for (const [key, value] of Object.entries(generator)) {
                if (!generatorsUpdate[i].hasOwnProperty(key)) {
                  generatorsUpdate[i][key] = value;
                }
              }
            }
          }

          setGenerators(generatorsUpdate);
          accProducedPower = parseFloat(accProducedPower.toFixed(2));
          setMaxPower(accProducedPower * 1.5);
          setTotalProduced(accProducedPower);
        }
      }
    }));
  };

  React.useEffect(() => {
    let acc = 0;
    Object.keys(loads).map((load) => {
      if (loads[load].status) {
        acc += loads[load].nominalPower;
      }
    });
    setTotalConsumption(acc);
    addOnMessage(loads, setLoads, setLoadBuses, setGenerators, setMaxPower, setTotalProduced, setFreq);
  }, [loads]);
  React.useEffect(() => {
    const tmpLoads = {};
    const tmploadsBuses = [];
    const tmpGenerators = [];
    const loadBusesMap = { name: 'VBLnames', vbs: 'VL' };
    const generatorsMap = {
      name: 'name',
      bus: 'VBGnames',
      nominalPower: 'nominalPower',
      producedPower: 'PowerG',
      status: 'Gstate',
      vbs: 'VG'
    };
    firestore.collection('loads').get().then((res) => {
      res.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        tmpLoads[doc.data().code] = doc.data();
      });
      setLoads(tmpLoads);
    });
    firestore.collection('loadBuses').get().then((res) => {
      res.forEach((doc) => {
        const tmpObj = {};
        Object.keys(doc.data()).map((key) => {
          tmpObj[loadBusesMap[key]] = doc.data()[key];
        });
        tmploadsBuses.push(tmpObj);
        // [doc.data().code] = doc.data();
      });
      setLoadBuses(tmploadsBuses);
    });
    firestore.collection('systemStatus').doc('system').get().then((res) => {
      setFreq(res.data().freq);
    });
    firestore.collection('generators').get().then((res) => {
      res.forEach((doc) => {
        const tmpObj = {};
        Object.keys(doc.data()).map((key) => {
          tmpObj[generatorsMap[key]] = doc.data()[key];
        });
        tmpGenerators.push(tmpObj);
        // [doc.data().code] = doc.data();
      });
      setGenerators(tmpGenerators);
    });
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
            <NumberWidget name="Frequency" value={parseFloat(freq)} isChart unit="Hz" yellowFrom={58} yellowTo={58.5} redFrom={57} redTo={58} min={57} max={65} />
          </Grid>
          <Grid
            item
            lg={3}
            sm={6}
            xl={3}
            xs={12}
          >
            <NumberWidget name="Average Voltage" value={parseFloat(averageVoltage)} isChart unit="voltage" yellowFrom={240} yellowTo={270} redFrom={270} redTo={300} min={0} max={300} />
          </Grid>
          <Grid
            item
            lg={3}
            sm={6}
            xl={3}
            xs={12}
          >
            <NumberWidget name="Produced Power" value={parseFloat(totalProduced)} isChart unit="MW" yellowFrom={maxPower - 30} yellowTo={maxPower - 15} redFrom={maxPower - 15} redTo={maxPower} min={0} max={maxPower} />
          </Grid>
          <Grid
            item
            lg={3}
            sm={6}
            xl={3}
            xs={12}
          >
            <NumberWidget name="Consumed Power" value={parseFloat(totalConsumption)} isChart unit="KW" yellowFrom={maxPower - 30} yellowTo={maxPower - 15} redFrom={maxPower - 15} redTo={maxPower} min={0} max={maxPower} />
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
            {Object.keys(loads).length > 0
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
            <ListBusses buses={loadBuses} freq={freq} loads={loads} />
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
