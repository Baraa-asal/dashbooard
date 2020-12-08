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
import AntSwitch from "@material-ui/core/Switch";

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
      <CardHeader title={`Loads (${loads.length})`}/>
      <Divider />
      <PerfectScrollbar>
        <Box minWidth={800}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  Area
                </TableCell>
                <TableCell sortDirection="desc">
                      Consumption
                </TableCell>
                <TableCell sortDirection="desc">
                      Current
                </TableCell>
                <TableCell>
                  Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loadsList.map((load, index) => (
                <TableRow
                  hover
                  key={`${load[0]}-${index}`}
                >
                  <TableCell>
                    {load[0]}
                  </TableCell>
                  <TableCell>
                    {load[5] > 0 && load[3] ? (load[5] * 230 / 1000).toFixed(1) : load[4]}
                    {' '}
                    MW
                  </TableCell>
                  <TableCell>
                    {load[3] ? load[5] : 0}
                    {' '}
                    A
                  </TableCell>
                  <TableCell>
                    <AntSwitch checked={load[3]} name="checkedC" color="primary" onChange={() => handleLoadClicked(index)} />
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
