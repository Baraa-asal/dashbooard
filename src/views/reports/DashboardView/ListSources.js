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

const ListSources = ({
  className, sources, averageVoltage, freq, ...rest
}) => {
  const classes = useStyles();
  const [sourcesList, setSourcesList] = useState([]);
  useEffect(() => {
    setSourcesList(sources);
  }, [sources]);

  return (
    <Card
      className={clsx(classes.root, className)}
      {...rest}
    >
      <CardHeader title="Generators" />
      <Divider />
      <PerfectScrollbar>
        <Box minWidth={800}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  Generator
                </TableCell>
                <TableCell sortDirection="desc">
                  Production
                </TableCell>
                <TableCell sortDirection="desc">
                  Current
                </TableCell>
                <TableCell sortDirection="desc">
                  Voltage
                </TableCell>
                <TableCell sortDirection="desc">
                  Inertia
                </TableCell>
                <TableCell sortDirection="desc">
                  Frequency
                </TableCell>
                <TableCell>
                  Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sourcesList.map((source, index) => (
                <TableRow
                  hover
                  key={`${source[0]}-${index}`}
                >
                  <TableCell>
                    {source[0]}
                  </TableCell>
                  <TableCell>
                    {source[4]}
                    {' '}
                    KW
                  </TableCell>
                  <TableCell>
                    {averageVoltage} V
                  </TableCell>
                  <TableCell>
                    000
                  </TableCell>
                  <TableCell>
                    000
                  </TableCell>
                  <TableCell>
                    {freq}
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={source[3] ? 'primary' : 'secondary'}
                      label={source[3] ? 'On' : 'Off'}
                      size="small"
                    />
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

ListSources.propTypes = {
  className: PropTypes.string
};

export default ListSources;
