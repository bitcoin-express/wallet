import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';

import AddFundsDialog from '../dialogs/AddFundsDialog';

export default class AddFundsTab extends React.Component {

  constructor (props) {
    super(props);

    this.state = {
      depositRef: null,
    };

    this._initializeStyles = this._initializeStyles.bind(this);
    this._initializeStyles(props);

    this.renderButtons = this.renderButtons.bind(this);
    this.updateDepositRef = this.updateDepositRef.bind(this);
  }

  componentWillMount() {
    this.updateDepositRef();
  }

  componentWillReceiveProps(nextProps) {
    this._initializeStyles(nextProps);
  }

  _initializeStyles(props) {
    this.styles = {
      container: {
        color: "white",
        fontFamily: "Roboto, sans-serif",
        margin: props.isFullScreen ? "40px 10px 20px 10px" : "10px",
        /*backgroundImage: "url('css/img/Bitcoin-express-bg.png')",
        backgroundPositionX: '-5%',
        backgroundPositionY: '70%',
        backgroundRepeat: 'no-repeat',*/
      },
      buttons: {
        marginTop: "40px",
        textAlign: "center",
      },
    };
  }

  updateDepositRef() {
    this.props.wallet.getDepositRef().then((depositRef) => {
      this.setState({
        depositRef,
      });
    });
  }

  renderButtons() {
    let {
      handleClickDeposit,
      handleRemoveDepositRef,
      issueCollect,
    } = this.props;

    if (this.state.depositRef) {
      return [
        <Button
          label="FORGET ADDRESS"
          key="forget-address"
          onClick={ handleRemoveDepositRef.bind(this, true, this.updateDepositRef) }
          style={{ margin: '0 0 10px 15px' }}
          variant="contained"
        />,
        <Button
          label="COLLECT COINS"
          key="collect-coins"
          onClick={ issueCollect.bind(this, true, this.updateDepositRef) }
          style={{ marginLeft: '15px' }}
          variant="contained"
        />
      ];
    }

    return <Button
      label="GET ADDRESS"
      key="get-address"
      onClick={ handleClickDeposit.bind(this, true, this.updateDepositRef) }
      variant="contained"
    />;
  }

  render() {
    const {
      isFlipped,
    } = this.props;

    const {
      depositRef,
    } = this.state;

    return <div style={ this.styles.container }> 
      <AddFundsDialog
        {...this.props }
        depositRef={ depositRef }
        isTab={ true }
        qrLabel="QR2"
        buttons={ <div style={ this.styles.buttons }>
          { this.renderButtons() }
        </div> }
      />
    </div>;
  }
}

