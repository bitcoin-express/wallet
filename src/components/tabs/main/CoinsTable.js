import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
} from '@material-ui/core/Table';

import CoinsTableHeader from './CoinsTableHeader';
import CoinRow from './CoinRow';
import DomainRow from './DomainRow';

import styles from '../../../helpers/Styles';

class CoinsTable extends Component {
  constructor(props) {
    super(props);

    this.styles = {
      section: {
        width: '100%',
        textAlign: 'right',
        marginBottom: '20px',
      },
    };
  }

  render() {
    const {
      isFullScreen,
      wallet,
    } = this.props;

    let coinList = [];
    if (wallet.config.storage) {
      coinList = wallet.getStoredCoins(true);
    }

    const border = coinList.length == 0 ? 'none' :
      `2px solid ${styles.colors.mainTextColor}`;
   
    let coinDomains = {};
    coinList.forEach((elt) => {
      if (!coinDomains[elt.d]) {
        coinDomains[elt.d] = [elt];
      } else {
        coinDomains[elt.d].push(elt);
      }
    });

    // sort the lists
    Object.keys(coinDomains).forEach((key) => {
      coinDomains[key].sort((a, b) => {
        return b.value - a.value;
      });
    });

    let elems = [];
    Object.keys(coinDomains).forEach((key, index) => {
      elems.push(<DomainRow
        index={ "dom_" + index }
        key={ "dom_" + index }
        domain={ key }
        isFullScreen={ isFullScreen }
      />);

      coinDomains[key].forEach((coin, idx) => {
        elems.push(<CoinRow
          { ...this.props }
          coin={ coin }
          index={ index + "_coin_" + idx }
          key={ index + "_coin_" + idx }
        />);
      });
    });


    return (
      <Table
        selectable={ false }
        style={{
          backgroundColor: 'transparent',
          overflow: 'hidden',
        }}
      >
        <TableHeader
          adjustForCheckbox={ false }
          displaySelectAll={ false }
          enableSelectAll={ false }
          style={{
            borderBottom: border,
          }}
        >
          <CoinsTableHeader
            { ...this.props }
            wallet={ wallet }
            totalCoins={ coinList.length }
          />
        </TableHeader>
        <TableBody
          displayRowCheckbox={ false }
        >
          { elems }
        </TableBody>
      </Table>
    );
  }
};

export default CoinsTable;
