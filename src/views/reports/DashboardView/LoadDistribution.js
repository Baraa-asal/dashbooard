import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Bar } from 'react-chartjs-2';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  useTheme,
  makeStyles,
  colors
} from '@material-ui/core';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import MyMap from './MyMap';
import SystemHealth from './SystemHealth';

const useStyles = makeStyles(() => ({
  root: {}
}));

const LoadDistribution = ({
  className, loadslist, handleLoadClicked, ...rest
}) => {
  const classes = useStyles();

  return (
    <Card
      className={clsx(classes.root, className)}
      {...rest}
    >
      <CardHeader

        title={'Geo Load Distribution'}
      />
      <Divider />
      <CardContent>
        <Box
          position="relative"
        >
          { loadslist.length > 0 && (<MyMap loadslist={loadslist} handleLoadClicked={handleLoadClicked} />)}
        </Box>
      </CardContent>
    </Card>
  );
};

LoadDistribution.propTypes = {
  className: PropTypes.string,
  loadslist: PropTypes.array
};

export default LoadDistribution;
