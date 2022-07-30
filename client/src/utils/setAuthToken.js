import axios from 'axios'; //adding global header

const setAuthToken = token => {
    //when we have a token we will sent it with every request
    if(token){
        axios.defaults.headers.common['x-auth-token'] = token;
    } else {
        delete axios.defaults.headers.common['x-auth-token'];
    }
}

export default setAuthToken;