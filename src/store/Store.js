import { applyMiddleware, compose, createStore } from 'redux';

const { fromJS } = require('immutable');

import createSagaMiddleware from 'redux-saga';
import * as storage from 'redux-storage';
import createEngine from 'redux-storage-engine-reactnativeasyncstorage';
import createReducer from './state';
import { createLogger } from 'redux-logger';
import { initStoreSyncHelper, storeSyncMiddleware } from './ApiSyncHelper';

const logger = createLogger();
const sagaMiddleware = createSagaMiddleware();
const engine = createEngine('rn-data');

function configureStore(initialState = fromJS({})) {
    const middlewares = [
        storage.createMiddleware(engine),
        sagaMiddleware,
        storeSyncMiddleware
    ];
    // if (__DEV__) {
    //     middlewares.push(logger);
    // }

    const enhancers = [
        applyMiddleware(...middlewares)
    ];

    const store = createStore(createReducer(), initialState, window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose(...enhancers));

    // Extensions
    store.runSaga = sagaMiddleware.run;

    const load = storage.createLoader(engine);
    load(store)
        .then((newState) => {
            initStoreSyncHelper(store);
        })
        .catch(() => {
            console.warn('[redux-storage] Failed to load previous state');
            initStoreSyncHelper(store);
        });

    return store;
}

module.exports = configureStore;
