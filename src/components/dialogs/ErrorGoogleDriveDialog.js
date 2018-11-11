import React from 'react';
import PropTypes from 'prop-types';

import Tools from '../../helpers/Tools';

class ErrorGoogleDriveDialog extends React.Component {
  constructor(props) {
    super(props);

    this.tools = new Tools();
  }

  render() {
    const {
      fromLocalStorage,
    } = this.props;

    return <section>
      <h4>
        There was a problem and Google API can not be reached. Try checking your connection.
      </h4> 
      If you have correct access to Internet and the problem persist, please try checking if any of these reasons is the one causing the problem:
      <ul>
        { fromLocalStorage ? null : <li style={{ marginBottom: '20px' }}>
          <b>Bitcoin-express files have been removed in your Google Drive</b>. Please visit again Google Drive and try to recover those files from your History.
        </li> }
        <li>
          The <b>pop-up blocking is turned on</b> by default in your browser. When blocking a pop-up, some browsers displays an information bar, as well as an icon similar to { this.tools.getImageComponent('Popup-blocked.png', 20, 20, 'info/') } in the address bar.<br />
          <b>If you wish to store the coins of your wallet in your Google Drive</b>, modify your permisions in order to allow pop-ups for this site (bitcoin-e.org) from your browser preferences settings.
        </li>
      </ul>
    </section>;
  }
}

ErrorGoogleDriveDialog.defaultProps = {
  fromLocalStorage: false,
};

export default ErrorGoogleDriveDialog;
