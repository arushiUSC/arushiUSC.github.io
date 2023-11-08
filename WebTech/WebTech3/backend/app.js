const axios = require('axios');
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());
app.set('trust proxy',true)
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const app_id = 'ArushiGo-dummy-PRD-292d3cfae-ba25aff3';

app.get('/get-all-data/:keyword/:category/:shippingLocal/:shippingFree/:distance/:customLocation/:newConditionVal/:usedConditionVal', async (req, res) => {
  const keyword = req.params.keyword; 
  const categoryId = req.params.category;
  const shippingLocal = req.params.shippingLocal;
  const shippingFree = req.params.shippingFree;
  const maxDistance = req.params.distance;
  const buyerPostalCode = req.params.customLocation;
  const newConditionVal = req.params.newConditionVal;
  const usedConditionVal = req.params.usedConditionVal;

  const params = {
    'OPERATION-NAME': 'findItemsAdvanced',
    'paginationInput.entriesPerPage':'50',
    'REST-PAYLOAD': '',
    'RESPONSE-DATA-FORMAT': 'JSON',
    'SERVICE-VERSION': '1.0.0',
    'SECURITY-APPNAME': app_id,
    'keywords':keyword,
    'categoryId':categoryId,
    'itemFilter(0).name': 'MaxDistance',
    'itemFilter(0).value': maxDistance,
    'itemFilter(1).name': 'FreeShippingOnly',
    'itemFilter(1).value': shippingFree,
    'itemFilter(2).name': 'LocalPickupOnly',
    'itemFilter(2).value': shippingLocal,
    'itemFilter(3).paramName': 'HideDuplicateItems',
    'itemFilter(3).paramValue': 'true',
    'itemFilter(4).name': 'Condition',
    'itemFilter(4).value(0)': newConditionVal,
    'itemFilter(4).value(1)': usedConditionVal,
    'itemFilter(4).value(2)': 'Unspecified',
    'buyerPostalCode':buyerPostalCode,
    'outputSelector(0)':'SellerInfo',
    'outputSelector(1)':'StoreInfo'
  };

  const requestURL = 'https://svcs.ebay.com/services/search/FindingService/v1?';

  const url = `${requestURL}${Object.entries(params).map(([key, value]) => `${key}=${value}`).join('&')}`;

    try {
      const response = await axios.get(url);
      const data = response.data;
      res.json(data); 
  
    } catch (error) {
      res.status(500).json({ error: error.message });
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
    throw new Error('Error fetching Geoname Zip');
  }
});

const { MongoClient, ServerApiVersion } = require('mongodb');
const url = "mongodb+srv://arushi6131:arushi6131@cluster0.wxi9ivw.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(url, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
const mongocollection = client.db('ebayProject').collection('ebayWishlist');

app.get('/wishlist-add/:galleryURL/:title/:shippingServiceCost/:currentPrice/:itemId', async (req, res) => {
  try {
    const galleryURL = req.params.galleryURL;
    const title = req.params.title;
    const shippingServiceCost = req.params.shippingServiceCost;
    const currentPrice = req.params.currentPrice;
    const itemId = req.params.itemId;

    await mongocollection.insertOne({ itemId, title, galleryURL, currentPrice, shippingServiceCost, wishlistStatus: true });
    
  } catch (error) {
    console.error('Error adding item to wishlist:', error);
    res.status(500).json({ error: 'Error in adding item to wishlist' });
  }
});

app.get('/wishlist-remove/:itemId', async (req, res) => {
  try {
    const itemId = req.params.itemId; 
    await mongocollection.deleteOne({ itemId });
  } catch (error) {
    console.error('Error removing item from wishlist:', error);
    res.status(500).json({ error: 'Error in removing item from wishlist' });
  }
});

app.get('/wishlist-get-all', async (req, res) => {
  try {
    const wishlistAllItems = await mongocollection.find({}).toArray();
    res.json(wishlistAllItems);

  } catch (error) {
    console.error('Error retrieving wishlist items:', error);
  }
});

app.get('/wishlist-status/:itemId', async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const currItem = await mongocollection.findOne({ itemId });

    if (!currItem) {
      res.json({ itemId, wishlistStatus: false });
    } else {
      res.json({ itemId, wishlistStatus: currItem.wishlistStatus });
    }
  } catch (error) {
    console.error('Error retrieving wishlist status for item:', error);
  }
});

app.get('/get-single-item-ebay/:itemId', async (req, res) => {
  try {

    const itemID = req.params.itemId;
    const client_secret = 'PRD-92d3cfae46d6-f274-4a0e-900b-f880';
    const OAuthToken = require('./ebay_oauth_token'); 
    const oauthToken = new OAuthToken(app_id, client_secret);

    async function getApplicationToken() {
      try {
        const accessToken = await oauthToken.getApplicationToken();
        return accessToken;
      } catch (error) {
        console.error('Error obtaining access token:', error);
        throw error;
      }
    }

    const headersParam = await getApplicationToken();
    const header = {
      'X-EBAY-API-IAF-TOKEN': headersParam
    }

    const params = {
      callname: 'GetSingleItem',
      appid: app_id,
      responseencoding: 'JSON',
      version: '967',
      siteid: '0',
      ItemID: itemID,
      IncludeSelector: 'Description,Details,ItemSpecifics'
    };

    const api = 'https://open.api.ebay.com/shopping?';
    const requestUrl = `${api}${Object.entries(params).map(([key, value]) => `${key}=${value}`).join('&')}`;

    const response = await axios.get(requestUrl, { headers: header });
    const responseData = response.data;
    res.json(responseData);

  } catch (error) {
    res.status(500).json({ error: error.message });
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

app.get('/get-similar-products/:itemID', async (req, res) => {
  try {
    const itemID = req.params.itemID;
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
