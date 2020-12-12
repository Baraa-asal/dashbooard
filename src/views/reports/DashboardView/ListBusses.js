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

const useStyles = makeStyles(() => ({
  root: {},
  actions: {
    justifyContent: 'flex-end'
  }
}));

const ListBusses = ({
  className, buses, loads, ...rest
}) => {
  const classes = useStyles();
  const [busesList, setBusesList] = useState([]);
  useEffect(() => {
    setBusesList(buses);
  }, [buses]);

  return (
    <Card
      className={clsx(classes.root, className)}
      {...rest}
    >
      <CardHeader title="Load Buses" />
      <Divider />
      <PerfectScrollbar>
        <Box minWidth={800}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  Bus name
                </TableCell>
                <TableCell sortDirection="desc">
                  Vbs
                </TableCell>
                <TableCell>
                  Number of loads
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {busesList.map((bus, index) => (
                <TableRow
                  hover
                  key={`${bus[0]}-${index}`}
                >
                  <TableCell>
                    {bus.VBLnames}
                  </TableCell>
                  <TableCell>
                    {(bus.VL) ? parseFloat(bus.VL).toFixed(2) : 0}
                    {' '}
                    V(pu)
                  </TableCell>
                  <TableCell>
                    0
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

ListBusses.propTypes = {
  className: PropTypes.string
};

export default ListBusses;
