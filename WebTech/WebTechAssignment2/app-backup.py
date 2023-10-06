from flask import Flask, jsonify, render_template, request
import ssl
import json
import urllib.request
from ebay_oauth_token import OAuthToken
import requests

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/fetchAlldata', methods=['GET'])
def fetch_all_data():

    api_url = 'https://svcs.ebay.com/services/search/FindingService/v1?'
    app_id = 'ArushiGo-dummy-PRD-292d3cfae-ba25aff3'

    keywords = request.args.get('keywords')
    maxPriceName = 'MaxPrice'
    maxPriceValue = request.args.get('maxPrice')
    minPriceName = 'MinPrice'
    minPriceValue = request.args.get('minPrice')
    condition = request.args.get('condition')
    

    conditionList = condition.split(',')
    paramCondition=""

    for index in range(len(conditionList)):
        paramCondition += 'itemFilter(4).value(' + str(index)+')='+str(conditionList[index])+'&'

    seller = request.args.get('seller')  
    shipping = request.args.get('shipping') 
    sortBy = request.args.get('sortBy')

    params = {
        'OPERATION-NAME': 'findItemsAdvanced',
        'SERVICE-VERSION': '1.0.0',
        'SECURITY-APPNAME': app_id,
        'RESPONSE-DATA-FORMAT': 'JSON',
        'REST-PAYLOAD': '',
        'keywords': keywords,
        'paginationInput.entriesPerPage': 10,
        'sortOrder': sortBy,
        'itemFilter(0).name': maxPriceName,
        'itemFilter(0).value': maxPriceValue,
        'itemFilter(0).paramName': 'Currency',
        'itemFilter(0).paramValue': 'USD',
        'itemFilter(1).name': minPriceName,
        'itemFilter(1).value': minPriceValue,
        'itemFilter(1).paramName': 'Currency',
        'itemFilter(1).paramValue': 'USD',
        'itemFilter(2).name':'ReturnsAcceptedOnly',
        'itemFilter(2).value':seller,
        'itemFilter(3).name':'FreeShippingOnly',
        'itemFilter(3).value':shipping,
        'itemFilter(4).name': 'Condition&'
    }

    
    url = api_url + '&'.join([f"{key}={value}" for key, value in params.items()])
    url=url+paramCondition[:-1]

    ssl_context = ssl._create_unverified_context()
    response = urllib.request.urlopen(url, context=ssl_context)
    data = json.loads(response.read().decode())

    return(data)


@app.route('/getSingleItemID', methods=['GET'])
def get_single_item_id():
    try:
        itemID = request.args.get('ItemID')
        api_url='https://open.api.ebay.com/shopping?'

        client_id = "ArushiGo-dummy-PRD-292d3cfae-ba25aff3"
        client_secret = "PRD-92d3cfae46d6-f274-4a0e-900b-f880"
        oauth_utility = OAuthToken(client_id, client_secret)
        application_token = oauth_utility.getApplicationToken()

        headers = {
           "X-EBAY-API-IAF-TOKEN": oauth_utility.getApplicationToken()
        }

        params = {
            'callname' : 'GetSingleItem',
            'responseencoding' : 'JSON',
            'appid': client_id,
            'siteid': '0',
            'version' : '967',
            'ItemID' : itemID,
            'IncludeSelector' : 'Description,Details,ItemSpecifics'
        }

        url = api_url + '&'.join([f"{key}={value}" for key, value in params.items()])

        response = requests.get(url, headers=headers)
        data = response.json()
        return(data)
    
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")

    except Exception as e:
        print(f"An error occurred: {e}")

    return "Request completed"


if __name__ == '__main__':
    app.run(debug=True)

