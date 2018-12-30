import React from 'react';
import PropTypes from 'prop-types';

import Paper from '@material-ui/core/Paper';
import { BottomNavigation, BottomNavigationItem } from '@material-ui/core/BottomNavigation';

import styles from '../helpers/Styles';

class Submenu extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      selected: props.initialSelectedIndex,
    };

    this.styles = {
      submenu: {
        margin: '10px 5px 15px 5px',
        display: 'flex',
        flexWrap: 'wrap',
        width: '100%',
      },
      chip: {
        margin: '4px 10px 4px 10px',
        flexGrow: 1,
        cursor: 'pointer',
        transition: 'all 350ms',
        justifyContent: 'center',
      },
      label: {
        fontSize: '.8em',
        fontFamily: "'Anton', impact",
        letterSpacing: '1px',
      },
      selectedChip: {
        margin: '4px 10px 4px 10px',
        flexGrow: 1,
        transition: 'all 350ms',
        justifyContent: 'center',
      },
    };

    this.handleTouchTap = this.handleTouchTap.bind(this);
  }

  handleTouchTap(index) {
    return (ev) => {
      this.props.onTapChanged(index);
      this.setState({ selected: index });
    }
  }

  /*generateChips () {
    const { items } = this.props;
    const { selected } = this.state;

    return items.map((item, index) => {
      if (index == selected) {
        return (
          <Chip
            key={ item }
            backgroundColor="#8081ff"
            labelColor="white"
            labelStyle={ this.styles.label }
            style={ this.styles.selectedChip }
          >
            { item.toUpperCase() }
          </Chip>
        );
      } else {
        return (
          <Chip
            key={ item }
            style={ this.styles.chip }
            labelStyle={ this.styles.label }
            onClick={ this.handleTouchTap(index) }
          >
            { item.toUpperCase() }
          </Chip>
        );
      }
    });
  }

  render() {
    return (
      <div style={ this.styles.submenu }>
        { this.generateChips() }
      </div>
    );
  }*/

  render() {
    const { selected } = this.state;
    const { items } = this.props;

    return <span style={{ marginBottom: '10px' }}>
      <Paper
        zDepth={1}
      >
        <BottomNavigation
          selectedIndex={ selected }
          style={{
            backgroundColor: styles.colors.mainColor,
            height: '42px',
          }}
        >
        { items.map(({ label, icon }, index) => {
          if (index == selected) {
            return (
              <BottomNavigationItem
                className="submenu-item-selected"
                icon={ <i
                  className={ `fa fa-${icon}` }
                  style={{
                    color: styles.colors.mainTextColor,
                    display: 'none',
                  }}
                /> }
                key={ label }
                style={{
                  borderBottom: '2px solid #ff4081',
                }}
                label={ label }
              />
            );
          } else {
            return (
              <BottomNavigationItem
                className="submenu-item"
                icon={ <i
                  className={ `fa fa-${icon}` }
                  style={{
                    color: styles.colors.secondaryTextColor,
                    display: 'none',
                  }}
                /> }
                key={ label }
                style={{
                  borderBottom: `1px solid ${styles.colors.secondaryTextColor}`,
                }}
                label={ label }
                onClick={ this.handleTouchTap(index) }
              />
            );
          }
        })}
        </BottomNavigation>
      </Paper>
    </span>;
  }
}

Submenu.propTypes = {
  items: PropTypes.array.isRequired,
  onTapChanged: PropTypes.func.isRequired,
  initialSelectedIndex: PropTypes.number.isRequired,
};

Submenu.defaultProps = {
  initialSelectedIndex: 0,
};

export default Submenu;
