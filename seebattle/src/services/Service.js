import axios from 'axios';

const USER_URL = "http://localhost:9090/api/v1/users/allusers";
const BATTLE_URL = "http://localhost:9090/api/v1/allbattles";
const USER_INFO_URL = "http://localhost:9090/api/v1/users/userinfo";

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
    // getUserInfo(){
    //   const token = localStorage.getItem('jwtToken');
    //   const userId = localStorage.getItem('uid');
    //   console.log(userId + "  userId");
    //   return axios.get(USER_INFO_URL, userId, {
    //       headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': `Bearer ${token}`
    //       }
    //     })
    // }
}

export default new Service()