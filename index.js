const request = require('request-promise-native')
const bitcoin = require('bitcoinjs-lib')
const baseUrl = 'https://node2-dot-crypto-challenge-fall-2018.appspot.com/'
const id 			= 'aldous'

const getLatestPrime = async () => {
	try {
		const response = await request.get(baseUrl + 'blocks')
		const parsedResponse = JSON.parse(response);
		return parsedResponse[parsedResponse.length - 1]['prime']
	} catch (err) {
		return false
	}
}

const isPrime = (possiblePrime) => {
  if (possiblePrime % 2 == 0) {
      return false;
  }
  for (let i = 2; i < parseInt(Math.sqrt(possiblePrime)); i++) {
    if (possiblePrime % i == 0) {
        return false;
    }
  }
  return true;
}

const generateNextPrime = (n) => {
	while(true) { 
		if(isPrime(n)) return n; 
		n++; 
	}
}

const postNewBlock = async (n) => {
	try {
		const prime = bitcoin.crypto.sha256(Buffer.from(String(n))).toString('hex').toUpperCase();
		const options = {
			method: 'POST',
			url: baseUrl + 'mineBlock',
			body: { data: { id, prime } },
			json: true
		}
		const res = await request(options);
		return { status: true, num: n }
	} catch (err) {
		return { status: false, num: n }
	}
}

const consume = async (latestPrime) => {
	try {
		const res = await postNewBlock(generateNextPrime(latestPrime))
		if(!res.status) console.log(res)
		setTimeout(consume, 0.5, ++res.num); // Send to event loop & avoid stack-overflow  
	} catch(err) {
		console.log(err)
	}
} 
getLatestPrime()
.then((r) => { console.log(r); consume(r + 1) })
.catch(err => {})


