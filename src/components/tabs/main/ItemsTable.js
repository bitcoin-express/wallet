import React, {Component} from 'react';
import PropTypes from 'prop-types';

import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

import BitcoinCurrency from '../../BitcoinCurrency';
import ItemsTableHeader from './ItemsTableHeader';
import { isURLImage, getDomainFromURL } from '../../../helpers/tools';
import styles from '../../../helpers/Styles';

class ItemsTable extends Component {
  constructor(props) {
    super(props);

    this._checkReturnUrl = this._checkReturnUrl.bind(this);

    this.itemsToShow = 5;
  }

  _checkReturnUrl(url) {
    return <i
      className="fa fa-shopping-cart"
      style={{
        color: 'rgb(47, 68, 126)',
        fontSize: '40px',
        top: '15px'
      }}>
    </i>;

    let iurl = "css/img/ExportCoins.svg";
    if (isURLImage(url || "")) {
      iurl = url;
    }
    return <Avatar
      src={ iurl }
      className="hide-mini"
      size={ 40 }
      style={{
        margin: '5px',
      }}
    />;
  }

  render() {
    const {
      isFlipped,
      isFullScreen,
      itemList,
      handleShowItemPurchased,
      handleShowItemPurchasedList,
      showValuesInCurrency,
      wallet,
      xr,
    } = this.props;

    if (!itemList) {
      return <h3
        style={{
          textAlign: 'center',
          color: styles.colors.mainTextColor,
          fontFamily: styles.fontFamily,
          margin: '0',
          padding: '25px 0',
        }}
      >
        No items purchased yet
      </h3>;
    }

    let content = [];
    itemList.slice(0, this.itemsToShow).forEach(({ paymentAck, paymentDetails, details }, index) => {
      content.push(
        <ListItem
          key={ index }
          hoverColor="transparent"
          className="full-size-mini purchase-item-list"
          rightIcon={ <i
            className="fa fa-info-circle fa-2x"
            onClick={ handleShowItemPurchased({
              paymentAck,
              paymentDetails,
              details,
            }) }
            style={{
              color: styles.colors.mainTextColor,
              cursor: 'pointer',
              marginTop: '10px',
              float: 'right',
              position: 'absolute',
            }}
          /> }
          style={{
            cursor: 'arrow',
            color: styles.colors.mainBlack,
            width: '100%',
          }}
          leftAvatar={
            isFullScreen ? this._checkReturnUrl(paymentAck.return_url) : null
          }
        >
          <div style={{
            color: styles.colors.darkBlue,
          }}>
            { paymentDetails.memo }
          </div>
          <div
            style={{
              fontSize: 'small',
              marginBottom: '5px',
            }}
          >
            { getDomainFromURL(paymentDetails.payment_url) }
          </div>
          <BitcoinCurrency
            buttonStyle={{
              background: styles.colors.darkBlue,
            }}
            color={ styles.colors.mainTextColor }
            isFlipped={ isFlipped }
            removeInitialSpaces={ true }
            showValuesInCurrency={ showValuesInCurrency }
            style={{ display: 'inline-block' }}
            small={ isFullScreen }
            tiny={ !isFullScreen }
            value={ paymentDetails.amount }
            displayStorage={ false }
            wallet={ wallet }
            xr={ xr }
          />
        </ListItem>
      );
    });

    return <section>
      <ItemsTableHeader
        handleShowItemPurchasedList={ handleShowItemPurchasedList }
        itemsToShow={ this.itemsToShow }
        totalItems={ itemList.length }
      />
      <List>
        { content }
      </List>
    </section>;
  }
};

ItemsTable.defaultProps = {
  itemList: [],
};

export default ItemsTable;
