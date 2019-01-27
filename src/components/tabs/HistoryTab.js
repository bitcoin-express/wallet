import React from 'react';

import { AppContext } from "../../AppContext";
import FormArea from '../FormArea';
import HistoryDialog from '../dialogs/HistoryDialog';
import HistoryDialogTitle from './history/HistoryDialogTitle';
import HistoryMenu from './history/HistoryMenu';
import HistoryRow from './history/HistoryRow';
import HistoryTable from './history/HistoryTable';

import ReactPaginate from 'react-paginate';


class HistoryTab extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      filter: "",
      hasError: false,
      page: 0,
      selected: -1,
      txDialog: false,
    };

    this.rowsPerPage = 9;

    this.getTransactionRows = this.getTransactionRows.bind(this);
    this.handleChangeInputText = this.handleChangeInputText.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handleRowSelection = this.handleRowSelection.bind(this);
    this.handleShowTransaction = this.handleShowTransaction.bind(this);

    this.renderTransaction = this.renderTransaction.bind(this);

    this._getTransactionList = this._getTransactionList.bind(this);
    this._totalPages = this._totalPages.bind(this);
  }

  componentDidCatch(error, info) {
    const {
      snackbarUpdate,
      wallet,
    } = this.context;

    if (wallet.config && wallet.config.debug) {
      console.log(error);
      console.log(info);
    }

    this.setState({
      hasError: true,
    });

    snackbarUpdate(info.componentStack, "error");
  }

  componentWillReceiveProps(nextProps) {
    const {
      selected,
      tx,
    } = this.state;

    if (selected != -1 && this.props.transactions.length < nextProps.transactions.length) {
      this.setState({
        selected: selected + 1,
        tx: tx + 1,
      });
    }
  }

  handleRowSelection(row) {
    if (this.state.selected == row) {
      this.setState({
        selected: -1,
        tx: null,
      });
      return;
    }

    let selected = row + this.state.page * this.rowsPerPage;
    this.setState({
      selected: row,
      tx: selected,
    });
  }

  handleShowTransaction() {
    const {
      selected, // selected real index value without filter
      tx, // selected index with filter applied
    } = this.state;

    const transactions = this._getTransactionList();
    if (isNaN(tx) || !transactions[tx]) {
      return;
    }

    this.props.openDialog({
      title: <div>
        <HistoryDialogTitle
          action={ transactions[tx].action }
          date={ transactions[tx].date }
          info={ transactions[tx].info }
          wallet={ this.props.wallet }
        />
      </div>,
      titleStyle: {
        textAlign: 'left',
        textTransform: 'capitalize',
        fontSize: '28px',
      },
      body: <HistoryDialog
        { ...this.props }
        transaction={ transactions[tx] }
        oldBalance={ transactions[selected + 1] ? parseFloat(transactions[selected + 1].balance) : 0 }
      />
    });
  }

  handleChangeInputText(elem) {
    const {
      page,
    } = this.state;

    const total = this._totalPages();
    this.setState({
      filter: elem.target.value,
      page: page > total ? total : page, 
    });
  }

  handlePageChange({ selected }) {
    this.setState({
      page: selected,
      selected: -1,
      tx: null,
      txDialog: false,
    });
  }

  renderTransaction(tx, index) {
    const {
      selected,
    } = this.state;

    const transactions = this._getTransactionList();
    let previousBalance = 0;
    if (transactions[index + 1]) {
      previousBalance = parseFloat(transactions[index + 1].balance);
    }

    return <HistoryRow
      { ...this.props }
      key={ `row-${index}` }
      index={ index }
      onClickRow={ this.handleRowSelection }
      previousBalance={ previousBalance }
      transaction={ tx }
      selected={ selected == index }
    />;
  }

  _getTransactionList() {
    let {
      transactions,
    } = this.props;

    const {
      filter,
    } = this.state;

    if (!transactions) {
      return [];
    }

    if (filter != "") {
      transactions = transactions.filter((tx, index) => {
        if (!tx.str_filter) {
          return true;
        }
        return String(tx.str_filter).toLowerCase().indexOf(String(filter).toLowerCase()) > -1;
      });
    }

    return transactions;
  }

  _totalPages() {
    return Math.ceil(this._getTransactionList().length / this.rowsPerPage); 
  }

  getTransactionRows() {
    const {
      page,
    } = this.state;

    const init = page * this.rowsPerPage;
    const end = (page + 1) * this.rowsPerPage;

    return this._getTransactionList().slice(init, end).map((tx, index) => {
      return this.renderTransaction(tx, index);
    });
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    const {
      selected,
      txDialog,
      tx,
    } = this.state;

    const {
      isFullScreen,
    } = this.props;

    return (
      <div>
        <HistoryMenu
          className="full-size-mini"
          onChangeInputText={ this.handleChangeInputText }
          onClickShowTransaction={ this.handleShowTransaction }
          selected={ selected == -1 }
        />
        <HistoryTable
          isFullScreen={ isFullScreen }
          onCellClick={ this.handleRowSelection }
          rows={ this.getTransactionRows() }
        />
        <div className="paginate">
          <ReactPaginate
            activeClassName="active"
            initialPage={ 0 }
            marginPagesDisplayed={ 1 }
            nextLabel={ <span>&raquo;</span> }
            onPageChange={ this.handlePageChange } 
            pageCount={ this._totalPages() }
            pageRangeDisplayed={ 2 }
            previousLabel={ <span>&laquo;</span> }
          />
        </div>
      </div>
    );
  }
}

HistoryTab.contextType = AppContext;

export default HistoryTab;
