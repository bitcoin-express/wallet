import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

import BitcoinCurrency from '../../BitcoinCurrency';
import CoinDialog from '../../dialogs/CoinDialog';

import styles from '../../../helpers/Styles';

class CoinRow extends Component {
  constructor(props) {
    super(props);
    this.handleShowCoin = this.handleShowCoin.bind(this);
  }

  handleShowCoin() {
    const {
      closeDialog,
      coin,
      openDialog,
    } = this.props;

    openDialog({
      titleStyle: {
        padding: "0",
      },
      showCancelButton: false,
      onClickOk: closeDialog,
      title: "",
      body: <CoinDialog
        { ...this.props }
        coin={ coin }
      />,
    });
  }

  render() {
    const {
      coin,
      index,
      isFlipped,
      isFullScreen,
      showValuesInCurrency,
      wallet,
      xr,
    } = this.props;

    return <TableRow
      selectable={ false }
      style={{
        borderBottom: 'none',
      }}
    >
      <TableRowColumn
        style={{
          minWidth: '200px',
          paddingLeft: isFullScreen ? '10px' : '14px',
          paddingRight: '10px',
          textOverflow: 'inherit',
        }}
      >
        <BitcoinCurrency
          buttonStyle={{
            background: styles.colors.darkBlue,
          }}
          color={ styles.colors.mainTextColor }
          isFlipped={ isFlipped }
          showValuesInCurrency={ showValuesInCurrency }
          labelStyle={{
            fontWeight: isFullScreen ? 'inherit' : 'bold',
          }}
          style={{ display: 'inline-block' }}
          small={ isFullScreen }
          tiny={ !isFullScreen }
          value={ coin.value }
          wallet={ wallet }
          xr={ xr }
        />
      </TableRowColumn>
      <TableRowColumn style={{
        width : '30px',
        padding: '0',
        color: styles.colors.mainTextColor,
      }}>
        <i
          className="fa fa-info-circle fa-2x"
          onClick={ this.handleShowCoin }
          style={{
            cursor: 'pointer',
            marginTop: '-5px',
          }}
        />
      </TableRowColumn>
    </TableRow>;
  }
};

export default CoinRow;
