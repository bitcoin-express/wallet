import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';

import LogoText from '../../LogoText';
import { getImageComponent } from '../../../helpers/tools';


const componentStyles = (theme) => {

  return {
    rootTitle: {
      textAlign: 'left',
      fontSize: '35px',
      color: 'white',
    },
    rootIcons: {
      position: 'absolute',
      right: '30px',
      display: 'flex',
    },
  };
};


class DialogTitle extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const {
      classes,
      type,
    } = this.props;

    let title = "";
    let icons = {
      left: "",
      arrow: "",
      right: "",
    };

    switch(type) {
      case "AddFunds":
        title = "Add funds";
        icons = {
          left: "b.svg",
          arrow: "arrowRight.svg",
          right: "b-e.svg",
        };
        break;

      case "AboutDialog":
        return <div>
          About <br/>
          <LogoText />
        </div>;

      case "Send":
        title = "Send";
        icons = {
          left: "b-e.svg",
          arrow: "arrowRight.svg",
          right: "b.svg",
        };
        break;

      default:
        return null;
    }

    return <div>
      <div className={ classes.rootIcons }>
        { getImageComponent(icons.left) } 
        { getImageComponent(icons.arrow) } 
        { getImageComponent(icons.right) } 
      </div>
      <div className={ classes.rootTitle }>
        { title }
      </div>
    </div>;
  }
};

DialogTitle.propTypes = {
  type: PropTypes.string.isRequired,
};

export default withStyles(componentStyles)(DialogTitle);
