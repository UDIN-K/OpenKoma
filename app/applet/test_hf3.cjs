const https = require('https');

const data = JSON.stringify({
  model: 'meta-llama/Meta-Llama-3-8B-Instruct',
  messages: [{role: 'user', content: 'test'}],
  max_tokens: 10
});

const req = https.request('https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, (res) => {
  let body = '';
  res.on('data', (d) => body += d);
  res.on('end', () => console.log('1:', res.statusCode, body));
});
req.write(data); req.end();

const req2 = https.request('https://api-inference.huggingface.co/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, (res) => {
  let body = '';
  res.on('data', (d) => body += d);
  res.on('end', () => console.log('2:', res.statusCode, body));
});
req2.write(data); req2.end();
