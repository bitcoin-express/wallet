import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';

import EncryptSelector from '../../EncryptSelector';
import Button from '../../Button';
import FormArea from '../../FormArea';
import Title from '../../Title';

import styles from '../../../helpers/Styles';

class BackupWallet extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      password: "",
      encrypted: false,
      history: true,
      comment: "",
      fileName: "",
      href: "",
    };

    this.styles = {
      textfield: {
        width: '100%',
      },
      button2: {
        width: '48%',
        margin: '0 4% 10px 0',
      },
      button3: {
        width: '48%',
        margin: 'auto',
      },
    };

    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.backupToFile = this.backupToFile.bind(this);
    this.clearForm = this.clearForm.bind(this);
  }

  clearForm() {
    this.setState({
      password: "",
      encrypted: false,
      comment: "",
      fileName: "",
      href: "",
    }); 
  }

  handlePasswordChange(password, encrypted) {
    this.setState({ password, encrypted });
  }

  backupToFile() {
    const {
      comment,
      encrypted,
      history,
      password,
    } = this.state;

    const {
      balance,
      loading,
      snackbarUpdate,
      wallet,
    } = this.props;

    let args = {
      encrypt: encrypted,
      passphrase: password,
      saveHistory: history,
      comment,
      balance,
    };

    loading(true);
    return wallet.backupToFile(args).then(({ backup, fileInfo }) => {
      let href = encodeURIComponent(JSON.stringify(backup, null, 2));

      // https://www.w3.org/TR/REC-html40/sgml/sgmldecl.html
      // More than limit stablished
      /*
      if (href.length > 150000) { // 65535
        loading(false);
        snackbarUpdate([
          "File too big to download",
          "Try creating a backup without history"
        ]);
        return;
      }
      */

      let fileName = fileInfo.filename + fileInfo.balance.toFixed(8) + '.json';
      href = `data:application/json;charset=utf8,${href}`;
      loading(false);

      this.setState({
        href,
        fileName,
      });
    });
  }

  render () {
    const {
      comment,
      encrypted,
      history,
      href,
      fileName,
      password,
    } = this.state;

    const {
      isFullScreen,
    } = this.props;

    return (
      <FormArea
        isFullScreen={ isFullScreen }
      >
        <div style={{ padding: '10px 20px' }}>
          <Title
            isFullScreen={ isFullScreen }
            label="Backup wallet"
          />

          <Checkbox
            label="Include history and recovery coins in backup"
            checked={ history }
            labelStyle={{
              color: styles.colors.mainTextColor,
              fontSize: '13px',
            }}
            iconStyle={{
              fill: styles.colors.mainTextColor,
            }}
            onCheck={ (ev, history) => this.setState({ history }) }
          />

          <EncryptSelector
            onPasswordChange={ this.handlePasswordChange }
            password={ password }
            encrypted={ encrypted }
          />

          <TextField
            className="textArea"
            value={ comment }
            onChange={ (ev, comment) => this.setState({ comment }) }
            floatingLabelText="Comment"
            multiLine={ true }
            rows={ 2 }
            rowsMax={ 4 }
            floatingLabelFocusStyle={{
              color: styles.colors.secondaryTextColor,
            }}
            floatingLabelStyle={{
              color: styles.colors.secondaryBlue,
              top: '40px'
            }}
            inputStyle={{
              color: styles.colors.mainTextColor,
            }}
            style={{
              marginTop: '-15px',
              width: '100%',
            }}
          />

          { (href && fileName) ?
          <div style={{ marginTop: '20px' }}>
            <Button
              label="Reset"
              style={ this.styles.button2 }
              icon={ <i
                className="fa fa-undo"
                style={{
                  color: styles.colors.mainTextColor,
                }}
              /> }
              onClick={ this.clearForm }
            />
            <Button
              href={ href }
              label="Download"
              download={ fileName }
              style={ this.styles.button3 }
              icon={ <i
                className="fa fa-arrow-circle-down"
                style={{
                  color: styles.colors.mainTextColor,
                }}
              /> }
            /> 
          </div> :
          <Button
            label="Start Backup"
            disabled={ encrypted && (!encrypted || password.length <= 3) }
            onClick={ this.backupToFile }
            icon={ <i
              className="fa fa-files-o"
              style={{
                color: styles.colors.mainTextColor,
              }}
            /> }
          /> }
        </div>
      </FormArea>
    );
  }
}

BackupWallet.propTypes = {
  balance: PropTypes.number,
  loading: PropTypes.func,
  wallet: PropTypes.object.isRequired,
};

export default BackupWallet;
