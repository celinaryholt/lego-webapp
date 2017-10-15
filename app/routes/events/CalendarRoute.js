// @flow

import moment from 'moment';
import { dispatched } from '@webkom/react-prepare';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { fetchAll } from 'app/actions/EventActions';
import Calendar from './components/Calendar';

const loadData = ({ year, month }, dispatch) => {
  const date = moment([parseInt(year, 10), parseInt(month, 10) - 1]);
  if (date.isValid()) {
    const dateAfter = date
      .clone()
      .startOf('month')
      .startOf('week');
    const dateBefore = date
      .clone()
      .endOf('month')
      .endOf('week');
    return dispatch(
      fetchAll({
        dateAfter: dateAfter.format('YYYY-MM-DD'),
        dateBefore: dateBefore.format('YYYY-MM-DD')
      })
    );
  }
};

const mapStateToProps = (state, ownProps) => {
  const {
    year = moment().year(),
    month = moment().month() + 1
  } = ownProps.params;
  const user = ownProps.currentUser;
  const icalToken = user ? user.icalToken : null;

  const actionGrant = state.events.actionGrant;
  return {
    year,
    month,
    actionGrant,
    icalToken
  };
};

const mapDispatchToProps = { fetchAll };

// Todo: send PR to @webkom/react-prepare with cwrp compare function
export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  dispatched(loadData)
)(Calendar);
