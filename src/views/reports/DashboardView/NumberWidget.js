import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  colors,
  makeStyles
} from '@material-ui/core';
import { Chart } from 'react-google-charts';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%'
  },
  avatar: {
    backgroundColor: colors.red[600],
    height: 56,
    width: 56
  },
  differenceIcon: {
    color: colors.red[900]
  },
  differenceValue: {
    color: colors.red[900],
    marginRight: theme.spacing(1)
  }
}));

const NumberWidget = ({
  className, value, name, isChart, redTo, redFrom, yellowTo, yellowFrom, min, max, unit, ...rest
}) => {
  const classes = useStyles();

  return (
    <Card
      className={clsx(classes.root, className)}
      {...rest}
    >
      <CardContent>
        <Grid
          container
          justify="space-between"
          spacing={3}
        >
          <Grid item>
            <Typography
              color="textSecondary"
              gutterBottom
              variant="h6"
            >
              {name} ({unit || ""})
            </Typography>
            {!isChart && (
            <Typography
              color="textPrimary"
              variant="h3"
            >
              {value}
            </Typography>
            )}
            {isChart && (
            <div>
              <Chart
                width={250}
                height={140}
                chartType="Gauge"
                loader={<div>Loading Chart</div>}
                data={[
                  ['Label', 'Value'],
                  ['', parseFloat(parseFloat(value).toFixed(2))],
                ]}
                options={{
                  min: min,
                  max: max,
                  redFrom: redFrom,
                  redTo: redTo,
                  yellowFrom: yellowFrom,
                  yellowTo: yellowTo,
                  minorTicks: 5
                }}
                rootProps={{ 'data-testid': '1' }}
              />
            </div>
            )}
          </Grid>

        </Grid>
      </CardContent>
    </Card>
  );
};

NumberWidget.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.number
};

export default NumberWidget;
