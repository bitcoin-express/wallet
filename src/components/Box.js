import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';


const componentStyles = (theme) => {
  return {
    root: {
      margin: '2rem 0 1rem 0',
      padding: '1rem',
      borderRadius: '10px',
      boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
      backgroundColor: "white",
      color: '#636671',
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    title: {
      backgroundColor: "white",
      marginBlockStart: "-30px",
      width: "fit-content",
      padding: '0 10px',
      borderRadius: '10px',
      color: '#7990e0',
    },
    titleButton: {
      backgroundColor: "white",
      marginBlockStart: "-40px",
      width: "fit-content",
      padding: '0 10px',
      borderRadius: '10px',
      color: '#7990e0',
    },
  };
};


class Box extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      classes,
      children,
      title,
      button,
    } = this.props;

    return <div className={ classes.root }>
      { title ? <h3 className={ button ? classes.titleButton : classes.title }>
          { title }{ button }
        </h3> : null }
      { children }
    </div>;
  }
};

Box.defaultProps = {
  button: null,
};

export default withStyles(componentStyles)(Box);

