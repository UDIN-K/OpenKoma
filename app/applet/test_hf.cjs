const https = require('https');

const req = https.request('https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(res.statusCode, data);
  });
});

req.on('error', (e) => {
  console.error(e);
});

req.write(JSON.stringify({
  model: 'HuggingFaceH4/zephyr-7b-beta',
  messages: [{role: 'user', content: 'test'}]
}));
req.end();
