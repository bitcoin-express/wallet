import React from 'react';
import PropTypes from 'prop-types';

import Fab from '@material-ui/core/Fab';

class HistoryMenu extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      search: false,
    };

    this.initializeStyles = this.initializeStyles.bind(this);
    this.initializeStyles(this.state);
  }

  componentWillUpdate(nextProps, nextState) {
    this.initializeStyles(nextState);
  }

  initializeStyles(state) {
    this.styles = {
      container: {
        position: 'sticky',
        textAlign: 'right',
        paddingRight: '10px',
        top: '10px',
        zIndex: '2',
      },
      input: {
        borderRadius: '15px',
        marginRight: '-20px',
        height: '20px',
        marginTop: '-20px',
        display: state.search ? 'inline' : 'none',
        opacity: state.search ? '1' : '0',
        padding: '0 15px',
        verticalAlign: 'middle',
        transition: 'visibility 0s, opacity 0.5s linear',
        outline: 'none',
      },
      searchIcon: {
        marginRight: '10px',
      },
    };
  }

  render() {
    const {
      onChangeInputText,
      onClickShowTransaction,
      selected,
    } = this.props;

    return <div
      style={ this.styles.container }
    >
      <input
        type="text"
        style={ this.styles.input }
        onChange={ onChangeInputText }
      />
      <Fab
        mini={ true }
        secondary={ true }
        title="Search"
        style={ this.styles.searchIcon }
        onClick={ () => {
          this.setState({
            search: !this.state.search,
          }); 
        }}
      >
        <i className="fa fa-search" />
      </Fab>
      <Fab
        mini={ true }
        title={ selected ? "Click a row to activate" : "Show row info" }
        disabled={ selected }
        onClick={ onClickShowTransaction }
      >
        <i className="fa fa-lightbulb-o" />
      </Fab>
    </div>;
  }
}

HistoryMenu.propTypes = {
  onChangeInputText: PropTypes.func.isRequired,
  onClickShowTransaction: PropTypes.func.isRequired,
  selected: PropTypes.bool.isRequired,
};

export default HistoryMenu;
