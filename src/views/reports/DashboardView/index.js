import React, { useEffect, useRef, useState } from 'react';
import {
  Card,
  CardContent,
  Container,
  Grid,
  makeStyles, Typography
} from '@material-ui/core';
import moment from 'moment';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import { subscribe } from 'mqtt-react';
import mqtt from 'mqtt';
import Page from 'src/components/Page';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import clsx from 'clsx';
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

const Dashboard = ({ data }) => {
  const version = 0;
  const initFreq = 59;
  const initAverageVoltage = 218;
  const classes = useStyles();
  const [alertMsgs, setAlertMsgs] = React.useState([]);
  const [errorMsg, setErrorMsg] = React.useState('');
  const [warningMsg, setWarningMsg] = React.useState('');
  const [infoMsg, setInfoMsg] = React.useState('');
  const [totalConsumption, setTotalConsumption] = React.useState(0);
  const [totalProduced, setTotalProduced] = React.useState(100);
  const [totalProducedNominal, setTotalProducedNominal] = React.useState(100);
  const [microControllersStatus, setMicroControllerStatus] = React.useState([]);
  const [freq, setFreq] = React.useState(initFreq);
  const [mqttClient, setMqttClient] = React.useState(initFreq);
  const [averageVoltage, setAverageVoltage] = React.useState(initAverageVoltage);

  const [loads, _setLoads] = React.useState({});
  const loadsRef = useRef(loads);
  const setLoads = (data) => {
    loadsRef.current = data;
    _setLoads(data);
  };
  const [generators, _setGenerators] = React.useState([]);
  const generatorsRef = useRef(generators);
  const setGenerators = (data) => {
    generatorsRef.current = data;
    _setGenerators(data);
  };
  const [loadBuses, _setLoadBuses] = React.useState([]);
  const loadBusesRef = useRef(loadBuses);
  const setLoadBuses = (data) => {
    loadBusesRef.current = data;
    _setLoadBuses(data);
  };

  const [maxPower, setMaxPower] = useState(130);
  let client;

  const handleLoadClicked = (i) => {
    const tmpLoads = loads;
    tmpLoads[i].status = !tmpLoads[i].status;
    setLoads({ ...tmpLoads });
    const msg = { id: i, state: tmpLoads[i].status };
    mqttClient.publish('loads-control', JSON.stringify(msg));
  };
  const mergeObjects = (target, source) => {
    Object.keys(source).map((key) => {
      target[key] = source[key];
    });
    return target;
  };

  const handleMsg = (topic, message) => {
    const loads = loadsRef.current;
    const generators = generatorsRef.current;
    const loadBuses = loadBusesRef.current;
    let msg = {};
    try {
      msg = JSON.parse(message.toString());
    } catch (e) {
      console.log(e);
    }
    console.log(topic, msg);
    if (topic === 'alerts') {
      alertMsgs.push(msg);
      setAlertMsgs([...alertMsgs]);
    }
    if (topic === 'loads-updates') {
      if (msg?.id) {
        const tmpLoads = loads;
        if (tmpLoads && tmpLoads[msg?.id]) {
          tmpLoads[msg?.id].status = (msg.state == 'true');
          tmpLoads[msg?.id].latestPowerReading = msg.ValueLoad;
          tmpLoads[msg?.id].lastHB = new Date().getTime();
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
      const frequency = parseFloat(msg?.systemState?.freq.trim() || 59);
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
          const filteredGenerators = generators.filter((gen) => {
            return gen.VBGnames == generatorsUpdate[i].VBGnames;
          });
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
  };
  const addOnMessage = () => {
    if (client) {
      client.off('message', () => {
      });
      client.on('message', (topic, message) => handleMsg(topic, message));
    }
  };

  React.useEffect(() => {
    let acc = 0;
    let acc2 = 0;
    generators.map((generator) => {
      acc2 += generator.PowerG;
      if (generator.Gstate) {
        acc += parseFloat(generator.PowerG);
      }
    });
    setTotalProducedNominal(acc2);
    setTotalProduced(acc);
  }, [generators]);

  React.useEffect(() => {
    let acc = 0;
    const controllersStatus = {
      LoadA: { state: false, lastSeen: new Date().getTime() },
      LoadB: { state: false, lastSeen: new Date().getTime() },
      LoadC: { state: false, lastSeen: new Date().getTime() },
    };
    const time = new Date().getTime();
    Object.keys(loads).map((load) => {
      const loadObj = loads[load];
      const duration = moment.duration(moment(new Date()).diff(loadObj.lastHB));
      if (controllersStatus[loadObj.bus].lastSeen > duration.asSeconds()) {
        controllersStatus[loadObj.bus].lastSeen = duration.asSeconds();
        controllersStatus[loadObj.bus].state = (duration.asSeconds() < 180);
      }
      if (loads[load].status) {
        acc += parseFloat(loads[load].latestPowerReading);
      }
    });
    setMicroControllerStatus(controllersStatus);
    setTotalConsumption(acc);
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
        if (doc.data().code) {
          tmpLoads[doc.data().code] = doc.data();
        }
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
    client = mqtt.connect('ws://ip-160-153-252-170.ip.secureserver.net', {
      host: 'ip-160-153-252-170.ip.secureserver.net', port: 8888, username: 'feUser', password: 'Y=^j*kj7X3mnurXy&UJx7qJ'
    });
    client.on('connect', () => {
      setMqttClient(client);
      console.log('connected');
    });
    client.subscribe(['loads-updates', 'system-update', 'alerts']);
    addOnMessage();
  }, []);
  const closeAlertMsg = (index) => {
    let tmpMsgs = alertMsgs;
    tmpMsgs.splice(index, 1);
    setAlertMsgs([...tmpMsgs]);
  }
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
            <NumberWidget name="Produced Power" value={parseFloat(totalProduced)} isChart unit="MW" yellowFrom={totalProducedNominal * 0.9} yellowTo={totalProducedNominal * 0.95} redFrom={totalProducedNominal * 0.95} redTo={totalProducedNominal * 1.1} min={0} max={Math.round(totalProducedNominal * 1.1)} />
          </Grid>
          <Grid
            item
            lg={3}
            sm={6}
            xl={3}
            xs={12}
          >
            <NumberWidget name="Consumed Power" value={parseFloat(totalConsumption)} isChart unit="KW" yellowFrom={totalProducedNominal * 0.9} yellowTo={totalProducedNominal * 0.95} redFrom={totalProducedNominal * 0.95} redTo={totalProducedNominal * 1.1} min={0} max={Math.round(totalProducedNominal * 1.1)} />
          </Grid>
          <Grid
            item
            lg={3}
            sm={6}
            xl={3}
            xs={12}
          >
            <Card>
              <CardContent>
                <Typography
                  color="textSecondary"
                  gutterBottom
                  variant="h6"
                >
                  ESP32 Statuses
                </Typography>
                <List style={{ fontSize: '12px' }}>
                  <ListItem>
                    <FiberManualRecordIcon style={{ color: microControllersStatus.LoadA?.state ? 'green' : 'red' }} />
                    {' '}
                    <b>ESP-1 (Bus A):</b>
                    <span>{microControllersStatus.LoadA?.state ? 'Online' : `Offline since ${moment.duration(microControllersStatus.LoadA?.lastSeen, 'seconds').humanize()}`}</span>
                  </ListItem>
                  <ListItem>
                    <FiberManualRecordIcon style={{ color: microControllersStatus.LoadC?.state ? 'green' : 'red' }} />
                    {' '}
                    <b>ESP-2 (Bus B):</b>
                    <span>{microControllersStatus.LoadB?.state ? 'Online' : `Offline since ${moment.duration(microControllersStatus.LoadB?.lastSeen, 'seconds').humanize()}`}</span>
                  </ListItem>
                  <ListItem>
                    <FiberManualRecordIcon style={{ color: microControllersStatus.LoadC?.state ? 'green' : 'red' }} />
                    {' '}
                    <b>ESP-3 (Bus C):</b>
                    <span>{microControllersStatus.LoadC?.state ? 'Online' : `Offline since ${moment.duration(microControllersStatus.LoadC?.lastSeen, 'seconds').humanize()}`}</span>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          {alertMsgs?.length > 0 && (
            alertMsgs.map((msg, index) => (
              <Grid
                key={`alert-msg-${index}`}
                item
                lg={12}
                md={12}
                xl={12}
                xs={12}
              >
                <Alert onClose={() => { closeAlertMsg(index) }} variant={msg.type === 'danger' ? 'filled' : 'standard'} severity={msg.type === 'danger' ? 'error' : msg.type}>
                  <AlertTitle>{msg.type}</AlertTitle>
                  {msg.message}
                </Alert>
              </Grid>
            ))
          )}
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
  topic: [],
})(Dashboard);
