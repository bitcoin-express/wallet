import React from 'react';
import PropTypes from 'prop-types';

import styles from '../../../helpers/Styles';
import Tools from '../../../helpers/Tools';

export default class CurrencyItem extends React.Component {

  constructor(props) {
    super(props);

    this.tools = new Tools();
  }

  render() {
    const {
      name,
      available,
    } = this.props;
    let {
      code,
    } = this.props;

    if (code == "XBT") {
      code = "BTC";
    }

    return <section style={{
      lineHeight: '25px',
      display: 'flex',
      flexWrap: 'nowrap',
      justifyContent: 'start',
      fontSize: '12.5px'
    }}>
      <div>
        { this.tools.getImageComponent(`${code.toLowerCase()}e.png`, 40, 40, 'currencies/') }
      </div>
      <div style={{ marginLeft: '10px' }}>
        <div style={{
          fontWeight: 'bold',
          marginBottom: '-5px',
        }}>
          { name.toUpperCase() }
        </div>
        <span style={{
          color: styles.colors.mainBlue,
          fontSize: '16px',
        }}>
          <small>Available:</small> { available.toFixed(8) }
        </span>
      </div>
    </section>;
  }
};
