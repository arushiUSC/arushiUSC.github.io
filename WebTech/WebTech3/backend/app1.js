const express = require('express');
const axios = require('axios');
const app = express();
const cors = require('cors');
app.use(cors());

const port = process.env.PORT || 3000;

const api_url_get_all = 'https://svcs.ebay.com/services/search/FindingService/v1?';
const api_url_get_single_item = 'https://open.api.ebay.com/shopping?';
const app_id = 'ArushiGo-dummy-PRD-292d3cfae-ba25aff3';
const client_secret = 'PRD-92d3cfae46d6-f274-4a0e-900b-f880';

const OAuthToken = require('./ebay_oauth_token'); // Adjust the path as needed
const client_id = 'ArushiGo-dummy-PRD-292d3cfae-ba25aff3';
app.set('trust proxy',true)

const oauthToken = new OAuthToken(client_id, client_secret);

async function getApplicationToken() {
  try {
    const accessToken = await oauthToken.getApplicationToken();
    return accessToken;
  } catch (error) {
    console.error('Error obtaining access token:', error);
    throw error;
  }
}

app.use(express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://arushi6131:arushi6131@cluster0.wxi9ivw.mongodb.net/?retryWrites=true&w=majority";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let requestDataFromFrontend = null;


app.post('/send-data', async (req, res) => {
  const requestData = req.body; // Access the data sent in the request body
  console.log('Data received in the backend:', requestData);
  requestDataFromFrontend = requestData;
  // Handle the data, perform operations, and send a JSON response

  const {
    keywords,
    shippingOptionsLocal,
    shippingOptionsFree,
    distance: maxDistance,
    customLocation: buyerPostalCode,
    new_condition_numeric,
    used_condition_numeric,
    category: categoryId
  } = requestData;

  const commonParams = {
    'OPERATION-NAME': 'findItemsAdvanced',
    'SERVICE-VERSION': '1.0.0',
    'SECURITY-APPNAME': app_id,
    'RESPONSE-DATA-FORMAT': 'JSON',
    'REST-PAYLOAD': '',
    'paginationInput.entriesPerPage':'50',
    'keywords':keywords,
    'categoryId':categoryId,
    'buyerPostalCode':buyerPostalCode,
    'itemFilter(0).name': 'MaxDistance',
    'itemFilter(0).value': maxDistance,
    'itemFilter(1).name': 'FreeShippingOnly',
    'itemFilter(1).value': shippingOptionsFree,
    'itemFilter(2).name': 'LocalPickupOnly',
    'itemFilter(2).value': shippingOptionsLocal,
    'itemFilter(3).paramName': 'HideDuplicateItems',
    'itemFilter(3).paramValue': 'true',
    'itemFilter(4).name': 'Condition',
    'itemFilter(4).value(0)': new_condition_numeric,
    'itemFilter(4).value(1)': used_condition_numeric,
    'itemFilter(4).value(2)': 'Unspecified',
    'outputSelector(0)':'SellerInfo',
    'outputSelector(1)':'StoreInfo'
  };


  const url = `${api_url_get_all}${Object.entries(commonParams)
    .map(([key, value]) => `${key}=${value}`)
    .join('&')}`;

    try {
      const response = await axios.get(url);
      const data = response.data;
      const currentUrl = response.request._currentUrl;
      console.log(response);

      // Create a JSON response object
      const jsonResponse = {
        currentUrl,
        data, // Include the data from the Axios response
      };
  
      res.json(data); // Send the JSON response
  
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

app.get('/', (req, res) => {
  res.send('This is the homepage.');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.post('/get-single-item', async (req, res) => {
  try {
    const itemID = req.body;
    console.log('ItemID received in the backend:', itemID);

    // You can implement OAuth token retrieval logic here (similar to Flask code)
    const requestHeadersParam = await getApplicationToken();

    const requestParams = {
      callname: 'GetSingleItem',
      responseencoding: 'JSON',
      appid: app_id,
      siteid: '0',
      version: '967',
      ItemID: itemID,
      IncludeSelector: 'Description,Details,ItemSpecifics'
    };

    const requestHeaders = {
      'X-EBAY-API-IAF-TOKEN': requestHeadersParam
    }

    // const requestHeaders = {
    //   'X-EBAY-API-IAF-TOKEN': 'YOUR_IAF_TOKEN_HERE', // Replace with your IAF token
    // };

    const requestUrl = `${api_url_get_single_item}${Object.entries(requestParams)
      .map(([key, value]) => `${key}=${value}`)
      .join('&')}`;

    const response = await axios.get(requestUrl, { headers: requestHeaders });
    const responseData = response.data;
    console.log('Request header:', response);
    res.json(responseData);
    console.log('Single item data:', responseData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/get-similar-products', async (req, res) => {
  try {
    const itemID = req.body;
    console.log('ItemID received in the backend:', itemID);

    const requestParams = {
      'OPERATION-NAME': 'getSimilarItems',
      'SERVICE-NAME': 'MerchandisingService',
      'SERVICE-VERSION': '1.1.0',
      'CONSUMER-ID': app_id, 
      'RESPONSE-DATA-FORMAT': 'JSON',
      'REST-PAYLOAD': '',
      'itemId': itemID,
      'maxResults': 20
    };

    const requestUrl = 'https://svcs.ebay.com/MerchandisingService?' +
    Object.entries(requestParams)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    const response = await axios.get(requestUrl);
    const responseData = response.data;
    res.json(responseData);
    console.log('similar products data from backend:', responseData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/add-to-wishlist', async (req, res) => {
  try {
    const itemId = req.body.itemId; // Get the item ID from the request body
    const title = req.body.title;
    const galleryURL = req.body.galleryURL;
    const currentPrice = req.body.currentPrice;
    const shippingServiceCost = req.body.shippingServiceCost;

    // Use your MongoDB client to add the item to the collection
    const collection = client.db('HW3').collection('wishlist');
    const result = await collection.insertOne({ itemId, title, galleryURL, currentPrice, shippingServiceCost, wishlistStatus: true });

    
  } catch (error) {
    console.error('Error adding item to wishlist:', error);
    res.status(500).json({ error: 'Failed to add item to wishlist' });
  }
});

app.post('/remove-from-wishlist', async (req, res) => {
  try {
    const itemId = req.body.itemId; // Get the item ID to be removed from the request body

    // Use your MongoDB client to remove the item from the wishlist collection
    const collection = client.db('HW3').collection('wishlist');
    const result = await collection.deleteOne({ itemId });

  } catch (error) {
    console.error('Error removing item from wishlist:', error);
    res.status(500).json({ error: 'Failed to remove item from wishlist' });
  }
});


app.get('/get-wishlist-status-for-single-item/:itemId', async (req, res) => {
  try {
    const itemId = req.params.itemId; // Get the item ID from the URL parameter

    // Use your MongoDB client to find the item in the wishlist collection
    const collection = client.db('HW3').collection('wishlist');
    const wishlistItem = await collection.findOne({ itemId });

    if (wishlistItem) {
      res.json({ itemId, wishlistStatus: wishlistItem.wishlistStatus });
    } else {
      // If the item is not found in the wishlist, you can return a default status, e.g., false
      res.json({ itemId, wishlistStatus: false });
    }
  } catch (error) {
    console.error('Error retrieving wishlist status for item:', error);
    res.status(500).json({ error: 'Failed to retrieve wishlist status for item' });
  }
});

app.get('/get-all-wishlist-items', async (req, res) => {
  try {
    // Use your MongoDB client to retrieve all wishlist items from the collection
    const collection = client.db('HW3').collection('wishlist');
    const wishlistItems = await collection.find({}).toArray();
    
    res.json(wishlistItems);
  } catch (error) {
    console.error('Error retrieving wishlist items:', error);
    res.status(500).json({ error: 'Failed to retrieve wishlist items' });
  }
});

app.get('/get-google-search-images/:itemTitle', async (req, res) => {
  try {
    const productTitle = req.params.itemTitle;
    const requestUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(productTitle)}&cx=a7de185ec8ee94705&imgSize=huge&num=8&searchType=image&key=AIzaSyC1xq6UPJ5oFuRS-1Dipg1JZK6KCn4x5Xo`;

    console.log('From Google Backend: '+ requestUrl);
    const response = await axios.get(requestUrl);
    const responseData = response.data.items;
    res.json(responseData);
    console.log('From Google Backend: '+ responseData);

    return responseData;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching images from Google Custom Search API');
  }
});

app.get('/get-custom-zipcode/:zipcode', async (req, res) => {
  try {
    const zipCodeInput = req.params.zipcode;
    const requestUrl = `http://api.geonames.org/postalCodeSearchJSON?postalcode_startsWith=${zipCodeInput}&maxRows=5&username=arushi6131&country=US`;

    const response = await axios.get(requestUrl);
    const responseData = response.data;
    res.json(responseData);
    return responseData;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching images from Google Custom Search API');
  }
});

// app.get('/get-single-item', async (req, res) => {
//   try {
//     const itemID = req.query.ItemID;

//     // You can implement OAuth token retrieval logic here (similar to Flask code)

//     const requestParams = {
//       callname: 'GetSingleItem',
//       responseencoding: 'JSON',
//       appid: app_id,
//       siteid: '0',
//       version: '967',
//       ItemID: itemID,
//       IncludeSelector: 'Description,Details,ItemSpecifics',
//     };

//     const requestHeaders = {
//       'X-EBAY-API-IAF-TOKEN': 'YOUR_IAF_TOKEN_HERE', // Replace with your IAF token
//     };

//     const requestUrl = `${api_url_get_single_item}${Object.entries(requestParams)
//       .map(([key, value]) => `${key}=${value}`)
//       .join('&')}`;

//     const response = await axios.get(requestUrl, { headers: requestHeaders });
//     const responseData = response.data;

//     res.json(responseData);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });