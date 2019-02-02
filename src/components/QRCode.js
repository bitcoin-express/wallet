import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';

import { AppContext } from "../AppContext";


const componentStyles = (theme) => {
  const qr = {
    backfaceVisibility: 'hidden', 
    cursor: 'pointer',
    display: 'block',
    opacity: '1',
    transition: '.5s ease',
  };

  const qrDownloadContainer = {
    transition: '.5s ease',
    color: 'black',
    opacity: '0',
    position: 'relative',
    top: '-125px',
    textAlign: 'center',
  };

  return {
    hiddenLink: {
      position: 'absolute',
      visibility: '0',
      zIndex: '-1',
    },
    qr,
    qrHovered: Object.assign({}, qr, {
      opacity: '0.3',
    }),
    qrContainer: {
      width: '200px',
      height: '200px',
      marginLeft: 'calc(50% - 100px)',
    },
    qrDownloadContainer,
    qrDownloadContainerHovered: Object.assign({}, qrDownloadContainer, {
      opacity: '1',
    }),
    root: {
      marginBottom: '15px',
      height: '200px',
    },
    /*
    qrDownload: {
      backgroundColor: #4CAF50;
      color: white;
      padding: 16px 32px;
    },
    */
  };
}; 


class QRCode extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isHovered: false,
      qrLoaded: false,
    };

    this.updateQR = this.updateQR.bind(this);
    this._updateQR = this._updateQR.bind(this);
    this.handleSaveImage = this.handleSaveImage.bind(this);
  }


  componentDidMount() {
    this.updateQR();
  }


  handleSaveImage() {
    document.getElementById("img-download").click();
  }


  componentWillReceiveProps(nextProps) {
    const {
      depositRef,
    } = nextProps;

    if (this.props.depositRef == depositRef) {
      return;
    }

    if (depositRef) {
      this.setState({
        depositRef,
      });
      this.updateQR();
      return;
    }

    this.setState({
      qrLoaded: false,
    });
  }


  updateQR() {
    const {
      snackbarUpdate,
      wallet,
    } = this.context;

    const handleError = (err) => {
      snackbarUpdate("Could not load the address QR code", "warning");
    }

    return wallet.getDepositRef()
      .then(this._updateQR)
      .catch(handleError);
  }

  _updateQR(depositRef) {
    const {
      imageId,
    } = this.props;

    if (!depositRef || !depositRef.issueInfo || !depositRef.isDefaultIssuer) {
      return;
    }

    const {
      blockchainAddress,
      targetValue,
    } = depositRef.issueInfo;

    const optionsQR = {
      text: `bitcoin:${blockchainAddress}${targetValue > 0 ?
        `?amount=${targetValue}`: ""}`,
      ecLevel: 'M',
      size: 200,
      background: '#000',
      fill: '#fff',
    };

    window.$(`#${imageId}`).empty();
    window.$(`#${imageId}`).qrcode(optionsQR);

    setTimeout(() => {
      if (this.state.qrLodaded) {
        return;
      }

      let canvas = $(`#${imageId} canvas`)[0];
      let ctx = canvas.getContext('2d');

      $('#img-download').attr({
        href: canvas.toDataURL(),
        download: 'qrCode',
        target: '_blank'
      });

      this.setState({
        qrLoaded: true,
      });
    }, 2000);
  }


  render () {
    const {
      classes,
      imageId,
    } = this.props;

    const {
      isHovered,
    } = this.state;

    return <section className={ classes.root }>
      <div
        className={ classes.qrContainer }
        onClick={ this.handleSaveImage }
        onMouseEnter={ () => this.setState({ isHovered: true }) }
        onMouseLeave={ () => this.setState({ isHovered: false }) }
      >
        <div
          className={ isHovered ? classes.qrHovered : classes.qr }
          id={ imageId }
        />

        <div className={ isHovered ? classes.qrDownloadContainerHovered : classes.qrDownloadContainer }>
          <i
            aria-hidden="true"
            className="fa fa-download fa-5x"
            style={{ cursor: 'pointer' }}
            title="Save image..."
          />
        </div>

        <a
          id="img-download"
          key="link"
          className={ classes.hiddenLink }
        ></a>
      </div>
    </section>;
  }
};


QRCode.defaultProps = {
  imageId: "QR",
};

QRCode.contextType = AppContext;

export default withStyles(componentStyles)(QRCode);

