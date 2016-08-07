# Ultra-Lightbeam Dashboard + RESTful API
This repository serves as a home for the [Ultra-Lightbeam](https://github.com/FrancescoSTL/Ultra-Lightbeam) Dashboard and RESTful API. The Dashboard will soon allow users to see crowd-sourced data on ad-content load times for major ad networks on the web, while the RESTful API serves as the web-extension's trusty end-point to log benchmarking details to our server. 

## Installing Ultra-Lightbeam Dashboard

Clone the repository by running:

```
git clone https://github.com/FrancescoSTL/ultra-lightbeamdashboard.git
```

Download and install [Node.js](https://nodejs.org/en/download/)

## Running Ultra-Lightbeam Dashboard

Once you've cloned the repo and installed Node.js, you can start sherlock by running:

1. `npm install`
2. `node ./bin/www.js`
3. Navigate to `https://localhost:3000/`

## Testing the Ultra-Lightbeam RESTful API Locally

1. Start running the ultra-lightbeam dashboard as instructed above
2. Run `curl -d 'Data to send' http://localhost:3000/log/`

You should recieve back the message: `Data successfully recieved by Ultra-Lightbeam. Thanks :-).`

Congrats, you just successfully set up the local version of Ultra-Lightbeam's Dashboard!

# RESTful API Documentation

Want to start writing some dashboards? Below you'll find an example (shortened) JSON object we recieved after one user browsed the internet:
```
{
	"assets": [{
		assetCompleteTime": 315,
		"originUrl": "www.mlab.com",
		"hostUrl": "www.mlab.com",
		"adNetworkUrl": "ssl.google-analytics.com",
		"assetType": "script",
		"fileSize": "16022",
		"timeStamp": 1470369858230,
		"method": "GET",
		"statusCode": 200,
		"adNetwork": "Google"
	}, {
		"assetCompleteTime": 69,
		"originUrl": "github.com",
		"hostUrl": "github.com",
		"adNetworkUrl": "www.google-analytics.com",
		"assetType": "xmlhttprequest",
		"fileSize": "35",
		"timeStamp": 1470369918414,
		"method": "POST",
		"statusCode": 200,
		"adNetwork": "Google"
	}, {
		"assetCompleteTime": 125,
		"originUrl": "www.youtube.com",
		"hostUrl": "www.youtube.com",
		"adNetworkUrl": "googleads.g.doubleclick.net",
		"assetType": "xmlhttprequest",
		"fileSize": "133",
		"timeStamp": 1470421355148,
		"method": "GET",
		"statusCode": 200,
		"adNetwork": "Google"
	}]
}
```

1. **assetCompleteTime** `Integer` Amount of time (in milliseconds) that the network took to respond to the HTTP request for the asset. This is calculated using a time diff between [onSendHeaders](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/webRequest/onSendHeaders) and [onHeadersReceived](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/webRequest/onHeadersReceived).

2. **originUrl** `String` The URL from which the HTTP request originated. In many cases, this will be the hostUrl, however, sometimes ads will trigger their own HTTP requests. For example, checkout the following example from some real world data we pulled in [Ultra-Lightbeam Issue #17](https://github.com/FrancescoSTL/Ultra-Lightbeam/issues/17#issue-168984693)

3. **hostUrl** `String` The top level host URL from which the HTTP request originated. For example, if you have 3 tabs open and one request originates from the first tab (lets say, `youtube.com`), the top level host would always be said tab's url (`youtube.com`).
4. **adNetworkUrl** `String` The host URL of the ad asset.
5. **assetType** `String` Can be anything recieved by [webRequest.ResourceType](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/WebRequest/ResourceType).
6. **fileSize** `Integer` File size in octets of bits.
7. **timeStamp** `Integer` Time when the asset was requested (in milliseconds) since the [epoch](https://en.wikipedia.org/wiki/Epoch_(reference_date))
8. **method** `String` Either "GET" or "POST".
9. **statusCode** `Integer` Standard HTTP status code returned by the server. Ex: `200`, `404`, `301`, etc
10. **adNetwork** `String` The Ad Network for which the asset belongs.
