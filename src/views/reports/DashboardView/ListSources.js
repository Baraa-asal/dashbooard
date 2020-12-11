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
  const nominalPower = {
    'VG1': "274.5",
    'VG2' : "128",
    'VG3': "192",
  };
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
                <TableCell>
                  Bus
                </TableCell>
                <TableCell sortDirection="desc">
                  Production
                </TableCell>
                <TableCell sortDirection="desc">
                  Vbs
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
                    { `${source?.VBGnames?.substr(1)} (${nominalPower[source?.VBGnames]}MVA)`}
                  </TableCell>
                  <TableCell>
                    {source?.VBGnames || "none"}
                  </TableCell>
                  <TableCell>
                    {(source.PowerG) ? parseFloat(source.PowerG).toFixed(2) : 0}
                    {' '}
                    MW
                  </TableCell>
                  <TableCell>
                    {(source.VG) ? parseFloat(source.VG).toFixed(2) : 0}
                    {' '}
                    V(pu)
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={source.Gstate ? 'primary' : 'secondary'}
                      label={source.Gstate ? 'On' : 'Off'}
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
