import {applyMiddleware, compose, createStore} from "redux";
import {createLogger} from "redux-logger";
import thunk from "redux-thunk";
import promiseMiddleware from "redux-promise-middleware";
import reducers from "./reducers";

const logger = createLogger({
    collapsed: true,
    colors: {
        title: () => "green"
    }
});
const middleware = applyMiddleware(promiseMiddleware(), thunk, logger);

const store = createStore(
    reducers,
    compose(
        middleware,
        window.devToolsExtension ? window.devToolsExtension() : f => f
    )
);

if (module.hot) {
    module.hot.accept("./reducers", () => {
        store.replaceReducer(require('./reducers/index'));
    });
}

export default store;
