import React, {Component} from 'react';

import FormArea from '../FormArea';
import CoinsTable from './main/CoinsTable';
import ItemsTable from './main/ItemsTable';

import styles from '../../helpers/Styles';

class MainTab extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      isFullScreen,
      wallet,
    } = this.props;

    const {
      CRYPTO,
      ITEM_STORE,
      storage,
    } = wallet.config;

    const crypto = wallet.getPersistentVariable(CRYPTO, "XBT");

    if (!storage) {
      return null;
    }

    let itemList = [];
    let store = storage.get(ITEM_STORE, {})
    if (Object.keys(store).indexOf(crypto) != -1) {
      itemList = store[crypto];
    }

    return (
      <div>
        <FormArea
          isFullScreen={ isFullScreen }
        >
          <ItemsTable
            { ...this.props }
            itemList={ itemList }
          />
        </FormArea>
        <FormArea
          type="2"
          isFullScreen={ isFullScreen }
        >
          <CoinsTable
            { ...this.props }
          />
        </FormArea>
      </div>
    );
  }
};

export default MainTab;
