![Site-Sonar Header Image](https://cloud.githubusercontent.com/assets/9794516/17645622/e442be3a-615f-11e6-8898-4916fafca02c.png)

# Site Sonar Dashboard + RESTful API
A project aimed at identifying ad networks with the fastest and slowest performing ad's on the internet through crowd-sourced, easy to understand, and openly accessible benchmarking data. Inspired by [Lightbeam](https://github.com/mozilla/lightbeam), the [Site-Sonar browser extension]((https://github.com/FrancescoSTL/Site-Sonar) locates and benchmarks ad content silently while you browse. It is then sent to Site-Sonar's servers, where the data is aggregated and displayed on our [public dashboard](http://Site-Sonar.com/dashboard). This repository serves as a home for the Site-Sonar Dashboard and RESTful API. 

## Index
* [Summary](https://github.com/FrancescoSTL/Site-Sonar-Dashboard#Site-Sonar-dashboard--restful-api)
* [Running Site-Sonar Dashboard](https://github.com/FrancescoSTL/Site-Sonar-Dashboard#running-site-sonar-dashboard)
* [Testing RESTful API Locally](https://github.com/FrancescoSTL/Site-Sonar-Dashboard#testing-the-site-sonar-restful-api-locally)
* [API Docs](https://github.com/FrancescoSTL/Site-Sonar-Dashboard#api-documentation)
* [Privacy Policy](https://github.com/FrancescoSTL/Site-Sonar-Dashboard#privacy-policy)
* [FAQ](https://github.com/FrancescoSTL/Site-Sonar-Dashboard#faq)

## Running Site-Sonar Dashboard

Clone the repository by running:

```
git clone https://github.com/FrancescoSTL/Site-Sonar-dashboard.git
```

Download and install [Node.js](https://nodejs.org/en/download/)

Once you've cloned the repo and installed Node.js, you can start sherlock by running:

1. `npm install`
2. `node ./bin/www.js`
3. Navigate to `https://localhost:3000/`

## Testing the Site Sonar RESTful API Locally

1. Start running the Site-Sonar dashboard as instructed above
2. Run `curl -d 'Data to send' http://localhost:3000/log/`

You should recieve back the message: `Data successfully recieved by Site-Sonar. Thanks :-).`

Congrats, you just successfully set up the local version of Site-Sonar's Dashboard!

## API Documentation

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

2. **originUrl** `String` The URL from which the HTTP request originated. In many cases, this will be the hostUrl, however, sometimes ads will trigger their own HTTP requests. For example, checkout the following example from some real world data we pulled in [Site-Sonar Issue #17](https://github.com/FrancescoSTL/Site-Sonar/issues/17#issue-168984693)

3. **hostUrl** `String` The top level host URL from which the HTTP request originated. For example, if you have 3 tabs open and one request originates from the first tab (lets say, `youtube.com`), the top level host would always be said tab's url (`youtube.com`).

4. **adNetworkUrl** `String` The host URL of the ad asset.

5. **assetType** `String` Can be anything recieved by [webRequest.ResourceType](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/WebRequest/ResourceType).

6. **fileSize** `Integer` File size in octets of bits.

7. **timeStamp** `Integer` Time when the asset was requested (in milliseconds) since the [epoch](https://en.wikipedia.org/wiki/Epoch_(reference_date))

8. **method** `String` Either "GET" or "POST".

9. **statusCode** `Integer` Standard HTTP status code returned by the server. Ex: `200`, `404`, `301`, etc

10. **adNetwork** `String` The Ad Network for which the asset belongs.

## Privacy Policy

### Site-Sonar Privacy Summary
Site-Sonar is a browser extension currently supported in Firefox, Chrome, and Opera, which silently collects data about how ad's are performing in your browser. After collecting that data, it will be sent to Site-Sonar's server to aggregate (unless you opt out) and keep ad networks accountable through publicly accessible performance information on our [dashboard](http://Site-Sonar.com/dashboard) (hosted in this repo).

### What you should know

1. Upon installing Site-Sonar, data will be collected locally and stored in your browser. Unless you opt out, every 2 minutes, that data will be sent to Site-Sonar servers for aggregation and display on our public dashboard.
2. By default, data collected by Site-Sonar is sent to us.
3. You can chose to opt out of sending any data to us.
4. If you do contribute Site-Sonar data to us, your browser will send us your data in a manner which we believe minimizes your risk of being re-identified (you can see a list of the kind of data involved here). We will post your data along with data from others in an aggregated and open database. Opening this data can help users and researchers make more informed decisions based on the collective information.
5. Uninstalling Site-Sonar prevents collection of any further Site-Sonar data and will delete the data stored locally in your browser.

## FAQ

### Will Site-Sonar track my browsing history?
Sort of. Once installed, Site-Sonar collects the host url of any website you browse that hosts ad content. Read more in our [Privacy Policy](https://github.com/FrancescoSTL/Site-Sonar#privacy-policy) or [Summary of Data Collection](https://github.com/FrancescoSTL/Site-Sonar#data-Site-Sonar-collects).

### How can I contribute?
Check out our installation instructions and then head to our Github Issues page for either the [Site-Sonar web extension](http://github.com/francescostl/Site-Sonar/issues) (this repo), or the [Site-Sonar Dashboard](http://github.com/francescostl/Site-Sonar-dashboard/issues).

### Who are you?
A group of humans interested in making the internet a better place through a pragmatic approach to problems on the web.

Specifically:
* [Francesco Polizzi](http://www.francesco.tech)
* [Asa Dotzler](https://asadotzler.com/)
* [Purush Kaushik](https://www.linkedin.com/in/purukaushik)
* [Justin Potts](https://twitter.com/PottsJustin/)

### How can we contact you?
Visit our [Contact Page](http://Site-Sonar.com/contact).
