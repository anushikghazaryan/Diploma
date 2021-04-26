import axios from 'axios';

const USER_URL = "http://localhost:9090/api/v1/users/allusers";
const BATTLE_URL = "http://localhost:9090/api/v1/allbattles";

class Service{
    getAllUsers(){
        const token = localStorage.getItem('jwtToken');
        return axios.get(USER_URL, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
    }
    getAllBattles(){
      const token = localStorage.getItem('jwtToken');
      return axios.get(BATTLE_URL, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
  }
}

export default new Service()