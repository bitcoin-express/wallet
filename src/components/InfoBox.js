import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';

import { AppContext } from "../AppContext";
import styles from '../helpers/Styles';


const componentStyles = (theme) => {

  const root = {
    borderRadius: '10px',
    backgroundColor: 'rgba(253, 207, 79)',
    overflow: 'hidden',
    margin: '10vh 10vw',
    fontSize: '150%',
    padding: '20px 10px',
    position: 'relative',
    boxShadow: `0px 2px 4px -1px rgba(0,0,0,0.2), 
      0px 4px 5px 0px rgba(0,0,0,0.14), 
      0px 1px 10px 0px rgba(0,0,0,0.12)`,
  };

  return {
    root,
    rootMin: Object.assign({}, root, {
      fontSize: 'inherit',
      margin: '15px 10px',
    }),
    icon: {
      color: "#9a823d",
      opacity: '0.2',
      position: 'absolute',
      textAlign: 'center',
      width: '100%',
      zIndex: '0',
    },
    text: {
      color: '#925a12',
      textAlign: 'center',
      zIndex: '1',
    },
  };
};


class InfoBox extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const {
      children,
      classes,
      hidden,
      withBackgroundIcon,
    } = this.props;

    if (hidden) {
      return null;
    }

    const {
      isFullScreen,
    } = this.context;

    return <div className={ isFullScreen ? classes.root : classes.rootMin }>
      { withBackgroundIcon ? <div className={ classes.icon }>
        <i className="fa fa-exclamation-triangle fa-4x" />
      </div> : null }
      <div className={ classes.text }>
        { children }
      </div>
    </div>;
  }
};


InfoBox.defaultProps = {
  hidden: false,
  iconColor: styles.colors.mainRed,
  withBackgroundIcon: false,
};

InfoBox.contextType = AppContext;


export default withStyles(componentStyles)(InfoBox);

