import { AsyncLocalStorage } from 'node:async_hooks';
const ALS = new AsyncLocalStorage();
export default ALS;
