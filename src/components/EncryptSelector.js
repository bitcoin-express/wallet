import React from 'react';
import PropTypes from 'prop-types';

import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import styles from '../helpers/Styles';

class EncryptSelector extends React.Component {

  constructor(props) {
    super(props);

    this.styles = {
      container: {
        margin: '5px 0 10px 0',
      },
      password: {
        display: 'grid',
        gridTemplateColumns: 'calc(100% - 150px) 140px',
        gridTemplateAreas: '"textarea button"',
        gridGap: '10px',
        marginTop: '5px',
      },
      textarea: {
        width: '100%',
        gridArea: 'textarea',
        marginTop: '-5px', // '-32px',
      },
      button: {
        width: '100%',
        gridArea: 'button',
        backgroundColor: styles.colors.secondaryBlue,
      },
    };

    this.generatePassword = this.generatePassword.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
  }

  generatePassword(ev) {
    let password = '';
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    // random size between 6 and 10
    const length = parseInt(Math.random() * 4 + 6);

    for (let i = length; i > 0; --i) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }
    this.handlePasswordChange(ev, password);
  }

  handlePasswordChange(ev, password) {
    const { encrypted } = this.props;
    this.props.onPasswordChange(password, encrypted);
  }

  render () {
    const {
      password,
      encrypted,
      style,
      label,
      iconStyle,
    } = this.props;

    return (
      <div style={ this.styles.container }>
        <Checkbox
          label={ label }
          checked={ encrypted }
          labelStyle={ Object.assign({
            width: 'initial',
            color: styles.colors.mainTextColor,
            fontSize: '13px',
          }, style) }
          iconStyle={ Object.assign({
            fill: styles.colors.mainTextColor,
          }, iconStyle) }
          onCheck={ (ev, encrypted) => {
            this.props.onPasswordChange(password, encrypted);
          }}
        />
        { encrypted ? <div style={ this.styles.password }>
          <TextField
            hintText="Password"
            value={ password }
            disabled={ !encrypted }
            onChange={ this.handlePasswordChange }
            floatingLabelText=""
            style={ this.styles.textarea }
            floatingLabelFocusStyle={{
              color: styles.colors.secondaryTextColor,
            }}
            floatingLabelStyle={{
              color: styles.colors.secondaryBlue,
            }}
            inputStyle={ Object.assign({
              color: styles.colors.mainTextColor,
            }, style) }
          />
          <Button
            label="Generate"
            secondary={ true }
            disabled={ !encrypted }
            onClick={ this.generatePassword }
            style={ this.styles.button }
            labelStyle={{
              color: encrypted ? styles.colors.mainTextColor :
                styles.colors.secondaryTextColor,
            }}
          />
        </div> : null }
      </div>
    );
  }
}

EncryptSelector.propTypes = {
  onPasswordChange: PropTypes.func.isRequired,
  password: PropTypes.string,
  encrypted: PropTypes.bool,
};

EncryptSelector.defaultProps = {
  style: {},
  iconStyle: {},
  label: "Encrypt coins",
};

export default EncryptSelector;
