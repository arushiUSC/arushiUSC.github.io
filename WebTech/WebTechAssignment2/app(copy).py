from flask import Flask, jsonify, render_template, request
import ssl
import json
import urllib.request

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/printData', methods=['GET'])
def fetch_data_from_ebay():

    api_url = 'https://svcs.ebay.com/services/search/FindingService/v1?'
    app_id = 'ArushiGo-dummy-PRD-292d3cfae-ba25aff3'

    keywords = request.args.get('keywords')
    maxPriceName = 'MaxPrice'
    maxPriceValue = request.args.get('maxPrice')
    minPriceName = 'MinPrice'
    minPriceValue = request.args.get('minPrice')

    params = {
        'OPERATION-NAME': 'findItemsAdvanced',
        'SERVICE-VERSION': '1.0.0',
        'SECURITY-APPNAME': app_id,
        'RESPONSE-DATA-FORMAT': 'JSON',
        'REST-PAYLOAD': '',
        'keywords': keywords,
        'paginationInput.entriesPerPage': 10,
        'sortOrder': 'BestMatch',
        'itemFilter(0).name': maxPriceName,
        'itemFilter(0).value': maxPriceValue,
        'itemFilter(0).paramName': 'Currency',
        'itemFilter(0).paramValue': 'USD',
        'itemFilter(1).name': minPriceName,
        'itemFilter(1).value': minPriceValue,
        'itemFilter(1).paramName': 'Currency',
        'itemFilter(1).paramValue': 'USD',
    }

    
    url = api_url + '&'.join([f"{key}={value}" for key, value in params.items()])

    ssl_context = ssl._create_unverified_context()

    response = urllib.request.urlopen(url, context=ssl_context)

    data = json.loads(response.read().decode())

    print(data)

    return data

if __name__ == '__main__':
    app.run(debug=True)
