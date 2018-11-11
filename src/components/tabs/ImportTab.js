import React from 'react';
import PropTypes from 'prop-types';

import Submenu from '../Submenu';
import ImportCoin from './import/ImportCoin';
import ImportFile from './import/ImportFile';

import styles from '../../helpers/Styles';

const states = {
  IMPORT_FILE: 0,
  IMPORT_COIN: 1,
};

class ImportTab extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      section: states.IMPORT_FILE,
    };

    this.styles = {
      body: {
        //minWidth: '150px',
      },
    };

    this.handleChipChanged = this.handleChipChanged.bind(this);
  }

  handleChipChanged(index) {
    this.setState({ section: index });
  }

  render() {
    const {
      section,
    } = this.state;
    
    const {
      isFullScreen,
    } = this.props;

    let content;
    if (isFullScreen) {
      content = <div style={ this.styles.body }>
        <ImportFile
          {...this.props}
        /> 
        <ImportCoin
          {...this.props}
          type="2"
        />
      </div>;
    } else {
      switch (section) {
        case states.IMPORT_FILE:
          content = <ImportFile
            {...this.props}
          />;
          break;
        case states.IMPORT_COIN:
          content = <ImportCoin
            {...this.props}
            type="1"
          />;
          break;
      }
      content = <div style={ this.styles.body }>
        <Submenu
          initialSelectedIndex={ section }
          onTapChanged={ this.handleChipChanged }
          items={ [{
            label: "import file",
            icon: "file-text",
          }, {
            label: "import coin",
            icon: "btc",
          }] }
        />
        { content } 
      </div>;
    }

    return content;
  }
}

ImportTab.propTypes = {
  loading: PropTypes.func.isRequired,
  wallet: PropTypes.object.isRequired,
  handleShowCoin: PropTypes.func.isRequired,
  refreshCoinBalance: PropTypes.func.isRequired,
  snackbarUpdate: PropTypes.func.isRequired,
  // balance: PropTypes.number,
};

export default ImportTab;
