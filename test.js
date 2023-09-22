const axios = require('axios');

// 有效的令牌
const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IuWwj-acsSIsImlhdCI6MTY5NDY5NzU2N30.m_mupkq-MlLgzhqxTZBpzM2DS5C8r_PdTHnC2gM0ZTU'

console.log('validtoken的值为' + validToken)

// 请求头部，包括 'authorization' 头部
const headers = {
    'Authorization': `Bearer ${validToken}`,
};

// 目标 URL
const url = 'http://localhost:61/users/test';

// 发送 GET 请求
axios.get(url, { headers })
    .then(response => {
        console.log('服务器响应:', response.data);
    })
    .catch(error => {
        console.error('请求出错:', error);
    });
