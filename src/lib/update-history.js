import { bigIntJSON } from '../common/bigIntJSON';

/**
 * Update history in local storage
 * @param {object} data
 * @return {array} history
 */
export function updateHistory(data) {
  const history = localStorage.getItem('history') ? bigIntJSON.parse(localStorage.getItem('history')) : [];

  // Prevent using whole quota of local storage
  if (history.length >= 25) {
    history.pop();
  }
  history.unshift({
    idx: data.method + data.endpoint + Date.now(),
    code: data,
    time: new Date().toLocaleTimeString(),
    date: new Date().toLocaleDateString(),
  });
  localStorage.setItem('history', bigIntJSON.stringify(history));
  return history;
}
