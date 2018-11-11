import React, {Component} from 'react';
import PropTypes from 'prop-types';

import styles from '../../../helpers/Styles';

class ItemsTableHeader extends Component {
  constructor(props) {
    super(props);

    this.updateStyles = this.updateStyles.bind(this);
    this.updateStyles(props);
  }

  componentWillReceiveProps(props) {
    this.updateStyles(props);
  }

  updateStyles(props) {
    this.styles = {
      content: {
        width: '100%',
        borderBottom: props.totalItems == 0 ? 'none' : `1px solid ${styles.colors.mainTextColor}`,
        fontFamily: styles.fontFamily,
        display: 'grid',
        height: '80px',
        gridTemplateColumns: 'calc(100% - 80px) 80px',
        gridTemplateAreas: '"info button"',
        gridGap: '0',
      },
      info: {
        gridArea: 'info',
      },
      infoContent: {
        display: 'table-cell',
        verticalAlign: 'middle',
        height: '80px',
      },
      infoNum: {
        fontSize: '24px',
        width: '100px',
        textAlign: 'center',
        color: styles.colors.mainTextColor,
      },
      infoText: {
        fontSize: '12px',
        width: '100px',
        textAlign: 'center',
        color: styles.colors.darkBlue,
      },
      button: {
        cursor: 'pointer',
        gridArea: 'button',
      },
      buttonIcon: {
        width: '80px',
        textAlign: 'center',
        color: styles.colors.mainTextColor,
      },
      buttonText: {
        fontSize: '12px',
        width: '80px',
        textAlign: 'center',
        color: styles.colors.darkBlue,
      },
    };
  }

  render() {
    const {
      handleShowItemPurchasedList,
      itemsToShow,
      totalItems,
    } = this.props;

    return <div style={ this.styles.content }>
      <div style={ this.styles.info }>
        <div style={ this.styles.infoContent }>
          <div style={ this.styles.infoNum }>
            { totalItems }
          </div>
          <div style={ this.styles.infoText }>
            PURCHASES
          </div>
        </div>
      </div>
      { totalItems > itemsToShow ? <div
        style={ this.styles.button }
        onClick={ handleShowItemPurchasedList }
      >
        <div style={ this.styles.buttonIcon }>
          <i
            className="fa fa-search-plus fa-2x"
            title="see more.."
            style={{ marginTop: '20px' }}
          />
        </div>
        <div style={ this.styles.buttonText }>
          see more...
        </div>
      </div> : null }
    </div>
  }
};

ItemsTableHeader.defaultProps = {
  totalItems: 0,
};

export default ItemsTableHeader;
