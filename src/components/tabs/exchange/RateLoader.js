import React from 'react';
import PropTypes from 'prop-types';

import CircularProgress from '@material-ui/core/CircularProgress';

import styles from '../../../helpers/Styles';

export default class RateLoader extends React.Component {

  constructor(props) {
    super(props);

    this.styles = {
      section: {
        alignItems: 'center',
        display: 'flex',
        height: 'calc(100vh - 250px)',
        justifyContent: 'center',
        textAlign: 'center',
      },
      content: {
        margin: '30px 0 0 0',
        fontFamily: 'Roboto, sans-serif',
        color: styles.colors.mainTextColor,
      },
    };
  }

  render() {
    let msg = this.props.message || "Loading Issuer Exchange Rates...";
    return <section style={ this.styles.section }>
      <div style={ this.styles.content }>
        <CircularProgress
          size={ 100 }
          thickness={ 5 }
          color={ styles.colors.mainTextColor }
        />
        <p>
          <small>{ msg }</small>
        </p>
      </div>
    </section>;
  }
}
