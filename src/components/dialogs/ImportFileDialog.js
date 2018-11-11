import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

class ImportFileDialog extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const {
      currencies,
      listComponents,
    } = this.props;

    if (listComponents.length == 0) {
      return null;
    }

    const cList = currencies.map((c, k) => {
      let crypto = c == "XBT" ? "btc" :
        c.toLowerCase();

      return <Tab key={ `cu${k}` }>
        <img
          src={ `css/img/currencies/${crypto}e.png` }
          width={ 25 }
          height={ 25 }
        /> { c }
      </Tab>;
    });

    return <section>
      <Tabs>
        <TabList>
          { cList }
        </TabList>
        { listComponents.map((c, k) => <TabPanel key={`co${k}`}>{ c }</TabPanel>) }
      </Tabs>
    </section>;
  }
}

ImportFileDialog.propTypes = {};
ImportFileDialog.defaultProps = {
  currencies: [],
  listComponents: [],
};

export default ImportFileDialog;
