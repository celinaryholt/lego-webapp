// @flow

import callAPI from 'app/actions/callAPI';
import { addToast } from 'app/actions/ToastActions';
import type { ID } from 'app/models';
import { quoteSchema } from 'app/reducers';
import type { Thunk } from 'app/types';
import { push } from 'connected-react-router';
import { startSubmit, stopSubmit } from 'redux-form';
import { Quote } from './ActionTypes';

const getEndpoint = (state, loadNextPage, queryString) => {
  const pagination = state.quotes.pagination;
  let endpoint = `/quotes/${queryString}`;
  const paginationObject = pagination[queryString];
  if (
    loadNextPage &&
    paginationObject &&
    paginationObject.queryString === queryString
  ) {
    endpoint = pagination[queryString].nextPage;
  }
  return endpoint;
};

export const fetchAll =
  ({
    approved = true,
    refresh = false,
    loadNextPage = false,
  }: {
    approved?: boolean,
    refresh?: boolean,
    loadNextPage?: boolean,
  } = {}): Thunk<*> =>
  (dispatch, getState) => {
    const queryString = `?approved=${String(approved)}`;
    const endpoint = getEndpoint(getState(), loadNextPage, queryString);
    if (!endpoint) {
      return Promise.resolve(null);
    }
    if (!loadNextPage) {
      dispatch({ type: Quote.CLEAR });
    }
    return dispatch(
      callAPI({
        types: Quote.FETCH,
        endpoint,
        schema: [quoteSchema],
        meta: {
          queryString,
          errorMessage: `Henting av ${
            approved ? '' : 'ikke '
          }godkjente sitater feilet`,
        },
        propagateError: true,
        cacheSeconds: Infinity, // don't expire cache unless we pass force
      })
    );
  };

export function fetchAllApproved({
  loadNextPage,
}: {
  loadNextPage: boolean,
}): Thunk<any> {
  return fetchAll({ approved: true, loadNextPage });
}

export function fetchAllUnapproved({
  loadNextPage,
}: {
  loadNextPage: boolean,
}): Thunk<any> {
  return fetchAll({ approved: false, loadNextPage });
}

export function fetchQuote(quoteId: number): Thunk<any> {
  return callAPI({
    types: Quote.FETCH,
    endpoint: `/quotes/${quoteId}/`,
    method: 'GET',
    meta: {
      quoteId,
      errorMessage: 'Henting av quote feilet',
    },
    schema: quoteSchema,
    propagateError: true,
  });
}

export function fetchRandomQuote(seenQuotes?: Array<ID> = []) {
  const queryString = `?seen=[${String(seenQuotes)}]`;
  return callAPI({
    types: Quote.FETCH_RANDOM,
    endpoint: `/quotes/random/${queryString}`,
    method: 'GET',
    meta: {
      queryString,
      errorMessage: 'Henting av tilfeldig quote feilet',
    },
    useCache: false,
    schema: quoteSchema,
  });
}

export function approve(quoteId: number): Thunk<any> {
  return callAPI({
    types: Quote.APPROVE,
    endpoint: `/quotes/${quoteId}/approve/`,
    method: 'PUT',
    meta: {
      errorMessage: 'Godkjenning av quote feilet',
      quoteId: Number(quoteId),
    },
  });
}

export function unapprove(quoteId: number): Thunk<any> {
  return callAPI({
    types: Quote.UNAPPROVE,
    endpoint: `/quotes/${quoteId}/unapprove/`,
    method: 'PUT',
    meta: {
      errorMessage: 'Underkjenning av quote feilet',
      quoteId: Number(quoteId),
    },
  });
}

export function addQuotes({
  text,
  source,
}: {
  text: string,
  source: string,
}): Thunk<*> {
  return (dispatch) => {
    dispatch(startSubmit('addQuote'));

    return dispatch(
      callAPI({
        types: Quote.ADD,
        endpoint: '/quotes/',
        method: 'POST',
        body: {
          text,
          source,
        },
        schema: quoteSchema,
        meta: {
          errorMessage: 'Legg til quote feilet',
        },
      })
    ).then(() => {
      dispatch(stopSubmit('addQuote'));
      dispatch(push('/quotes'));
      dispatch(
        addToast({
          message:
            'Sitat sendt inn. Hvis det blir godkjent vil det dukke opp her!',
          dismissAfter: 10000,
        })
      );
    });
  };
}

export function deleteQuote(id: number): Thunk<any> {
  return callAPI({
    types: Quote.DELETE,
    endpoint: `/quotes/${id}/`,
    method: 'DELETE',
    meta: {
      id,
      errorMessage: 'Sletting av quote feilet',
    },
  });
}
