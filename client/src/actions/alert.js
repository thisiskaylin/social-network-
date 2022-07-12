import { SET_ALERT, REMOVE_ALERT } from './types';
import { v4 as uuidv4 } from 'uuid';

export const setAlert = (msg, alertType, timeout = 5000) => dispatch => { //set alert
    const id = uuidv4();
    dispatch({
        type: SET_ALERT,
        payload: { msg, alertType, id } //dispatch set alert
    });
    //5000 = 5 sec
    setTimeout(() => dispatch({ type: REMOVE_ALERT, payload: id }), timeout);
};
