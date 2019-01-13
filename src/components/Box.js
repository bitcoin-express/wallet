import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';


const componentStyles = (theme) => {
  return {
    root: {
      margin: '2rem 0 1rem 0',
      padding: '1rem',
      border: '3px solid #63667130',
      borderRadius: '10px',
      backgroundColor: "#d8dff7",
      color: '#636671',
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    title: {
      backgroundColor: "#d8dff7",
      marginBlockStart: "-30px",
      width: "fit-content",
    },
    titleButton: {
      backgroundColor: "#d8dff7",
      marginBlockStart: "-40px",
      width: "fit-content",
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

