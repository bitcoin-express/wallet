import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';

import LogoText from '../../LogoText';

import Tools from '../../../helpers/Tools';


const componentStyles = (theme) => {

  return {
    rootTitle: {
      textAlign: 'left',
      fontSize: '35px',
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

    this.tools = new Tools();
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

    console.log(type);

    switch(type) {
      case "AddFunds":
        title = "Add funds"
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

      default:
        return null;
    }

    return <div>
      <div className={ classes.rootIcons }>
        { this.tools.getImageComponent(icons.left) } 
        { this.tools.getImageComponent(icons.arrow) } 
        { this.tools.getImageComponent(icons.right) } 
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