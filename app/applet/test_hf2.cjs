const https = require('https');

const req = https.request('https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct/v1/chat/completions', {
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

req.write(JSON.stringify({
  model: 'meta-llama/Meta-Llama-3-8B-Instruct',
  messages: [{role: 'user', content: 'test'}]
}));
req.end();
