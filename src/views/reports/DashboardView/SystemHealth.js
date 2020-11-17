import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Chart } from 'react-google-charts';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Typography,
  colors,
  makeStyles,
  useTheme, Button
} from '@material-ui/core';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

const useStyles = makeStyles(() => ({
  root: {
    height: '100%'
  }
}));

const SystemHealth = ({ className, ...rest }) => {
  const classes = useStyles();
  const theme = useTheme();
  const [chartData, setChartData] = React.useState([
    ['Year', 'Sales', 'Expenses'],
    ['2013', 1000, 400],
    ['2014', 1170, 460],
    ['2015', 660, 1120],
    ['2016', 1030, 540],
  ])
  let year = 2017;
  React.useEffect(()=>{
    setInterval(()=>{
      let tmpChartData = chartData;
      tmpChartData.push([year, Math.round(1000 * Math.random()), Math.round(1000 * Math.random())]);
      setChartData(tmpChartData)
      year++;
      console.log(year)
    },10000)
  }, [])
  const data = {
    datasets: [
      {
        data: [98, 2],
        backgroundColor: [
          colors.green[500],
          colors.red[600]
        ],
        borderWidth: 8,
        borderColor: colors.common.white,
        hoverBorderColor: colors.common.white
      }
    ],
    labels: ['System is up', 'Issue Faced']
  };

  const options = {
    animation: false,
    cutoutPercentage: 80,
    layout: { padding: 0 },
    legend: {
      display: false
    },
    maintainAspectRatio: false,
    responsive: true,
    tooltips: {
      backgroundColor: theme.palette.background.default,
      bodyFontColor: theme.palette.text.secondary,
      borderColor: theme.palette.divider,
      borderWidth: 1,
      enabled: true,
      footerFontColor: theme.palette.text.secondary,
      intersect: false,
      mode: 'index',
      titleFontColor: theme.palette.text.primary
    }
  };

  const devices = [
    {
      title: 'Up time',
      value: 98,
      icon: ArrowUpwardIcon,
      color: colors.green[500]
    },
    {
      title: 'Down time',
      value: 2,
      icon: ArrowDownwardIcon,
      color: colors.red[600]
    }
  ];

  return (
    <Card
      className={clsx(classes.root, className)}
      {...rest}
    >
      <CardHeader
        action={(
          <Button
            endIcon={<ArrowDropDownIcon />}
            size="small"
            variant="text"
          >
            Last 7 days
          </Button>
        )}
        title="System Health"
      />
      <Divider />
      <CardContent>
        <Box
          height={300}
          position="relative"
        >
          <Chart
            width="100%"
            height="300px"
            chartType="AreaChart"
            loader={<div>Loading Chart</div>}
            data={chartData}
            options={{
              title: 'Company Performance',
              hAxis: { title: 'Year', titleTextStyle: { color: '#333' } },
              vAxis: { minValue: 0 },
              // For the legend to fit, we make the chart area smaller
              chartArea: { width: '90%', height: '70%' },
              // lineWidth: 25
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

SystemHealth.propTypes = {
  className: PropTypes.string
};

export default SystemHealth;
