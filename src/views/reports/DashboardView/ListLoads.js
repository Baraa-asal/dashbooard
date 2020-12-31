import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import moment from 'moment';
import { v4 as uuid } from 'uuid';
import PerfectScrollbar from 'react-perfect-scrollbar';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Card,
  CardHeader,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  makeStyles
} from '@material-ui/core';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import AntSwitch from '@material-ui/core/Switch';

const useStyles = makeStyles(() => ({
  root: {},
  actions: {
    justifyContent: 'flex-end'
  }
}));

const ListLoads = ({
  className, loads, averageVoltage, handleLoadClicked, ...rest
}) => {
  const classes = useStyles();
  const [loadsList, setLoadsList] = useState([]);
  useEffect(() => {
    setLoadsList(loads);
  }, [loads]);

  return (
    <Card
      className={clsx(classes.root, className)}
      {...rest}
    >
      <CardHeader title={`Loads (${Object.keys(loads).length})`} />
      <Divider />
      <PerfectScrollbar>
        <Box minWidth={800}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  Load
                </TableCell>
                <TableCell sortDirection="desc">
                  Nominal Power Consumption
                </TableCell>
                <TableCell sortDirection="desc">
                  Consumption
                </TableCell>
                <TableCell>
                  Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.keys(loadsList).map((load, index) => (
                <TableRow
                  hover
                  key={`${load}-${index}`}
                >
                  <TableCell>
                    {loadsList[load].name}
                  </TableCell>
                  <TableCell>
                    {loadsList[load].nominalPower}
                    {' '}
                    MW
                  </TableCell>
                  <TableCell>
                    {(parseFloat(loadsList[load].latestPowerReading) > 0) ? parseFloat(loadsList[load].latestPowerReading).toFixed(1) : loadsList[load].nominalPower}
                    {' '}
                    MW
                  </TableCell>
                  <TableCell>
                    <AntSwitch checked={loadsList[load].status} name="checkedC" color="primary" onChange={() => handleLoadClicked(load)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </PerfectScrollbar>
      <Box
        display="flex"
        justifyContent="flex-end"
        p={2}
      >
        <Button
          color="primary"
          endIcon={<ArrowRightIcon />}
          size="small"
          variant="text"
        >
          View all
        </Button>
      </Box>
    </Card>
  );
};

ListLoads.propTypes = {
  className: PropTypes.string
};

export default ListLoads;
