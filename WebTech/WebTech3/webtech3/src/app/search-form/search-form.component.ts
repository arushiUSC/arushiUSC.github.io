import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import axios from 'axios';

interface Suggestion {
  postalCodes: string;
  postalCode: string;
}

interface BackendResponse {
  message: string;
  data: any; 
}

@Component({
  selector: 'app-search-form',
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.css']
})

export class SearchFormComponent implements OnInit{
  itemId: any;
  isDataLoaded: boolean = false;
  wishlistAllItems: any[] = [];
  wishlistStatus: Map<string, boolean> = new Map<string, boolean>();
  responseData: any;
  items: any[]=[];
  isInputValid = true;
  submitButtonPressed: boolean = false;
  shippingValues: string[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number=5;
  pages: number[] = [];
  paginatedItems: any[]=[];
  selectedSortOrder = 'Ascending';
  selectedSortCategory: string = 'Default';
  showMoreItems: boolean = false;
  itemFacebook: any;
  googleResultItems: any = [];
  isKeywordsValid: boolean = true;
  currItemId: any;
  getProductInfo: boolean=false;
  getSellerInfo:boolean=false;
  getSimilarProductsInfo:boolean=false;
  getPhotosInfo:boolean=false;
  similarProductsResponse: any = [];
  isProductDetailsAvailable: boolean = false;
  singleItemsResponse: any;
  showProductInfoTab: boolean = false;
  showResultsInfoTab: boolean = true;
  showBothTab: boolean = true;
  showWishlistInfoTab: boolean = false;
  getShippingInfo: boolean=false;
  currItem:any;
  currShippingPrice:any;
  noResults:boolean = false;

  searchQuery = {
    keyword: '',
    category: '0',
    newCondition: false,
    usedCondition: false,
    unspecifiedCondition: false,
    newConditionVal: 0,
    usedConditionVal: 0,
    shippingLocal: false,
    shippingFree: false,
    distance: 10,
    locationChoice: 'current',
    customLocation: '',
    customLocationInput:'',
  };

  constructor(private http: HttpClient ) { }
  ngOnInit(): void {
    this.getCurrentLocation();
  }

  showResults() {
    this.showWishlistInfoTab = false;
    this.showResultsInfoTab = true;
  }

  showWishlist() {
    this.showResultsInfoTab = false;
    this.showWishlistInfoTab = true;
    this.wishlistAll();
  }

  toggleTab(key: string){
    if(key=="getShippingInfo"){
      this.getShippingInfo=true;
      this.getProductInfo=false;
      this.getSellerInfo=false;
      this.getSimilarProductsInfo=false;
      this.getPhotosInfo=false;
    }

    if(key=="getProductInfo"){
      this.getShippingInfo=false;
      this.getProductInfo=true;
      this.getSellerInfo=false;
      this.getSimilarProductsInfo=false;
      this.getPhotosInfo=false;
    }
    if(key=="getSellerInfo"){
      this.getSellerInfo=true;
      this.getShippingInfo=false;
      this.getProductInfo=false;
      this.getSimilarProductsInfo=false;
      this.getPhotosInfo=false;
    }
    if(key=="getSimilarProductsInfo"){
      this.getSellerInfo=false;
      this.getShippingInfo=false;
      this.getProductInfo=false;
      this.getSimilarProductsInfo=true;
      this.getPhotosInfo=false;
    }
    if(key=="getPhotosInfo"){
      this.getSellerInfo=false;
      this.getShippingInfo=false;
      this.getProductInfo=false;
      this.getSimilarProductsInfo=false;
      this.getPhotosInfo=true;
    }
  }

  sortSimilarItems() {
    this.similarProductsResponse.getSimilarItemsResponse.itemRecommendations.item.sort((a: any, b: any) => {
      if (this.selectedSortCategory === 'Default') {
        return 0; 
      }
      if (this.selectedSortCategory === 'ShippingCost') {
        return a.shippingCost.__value__.localeCompare(b.shippingCost.__value__);
      }
      if (this.selectedSortCategory === 'ProductName') {
        return a.title.localeCompare(b.title);
      }
      if (this.selectedSortCategory === 'Price') {
        return a.buyItNowPrice.__value__.localeCompare(b.buyItNowPrice.__value__);
      }
      if (this.selectedSortCategory === 'DaysLeft') {
        const daysLeftA = this.getDaysLeft(a.timeLeft);
        const daysLeftB = this.getDaysLeft(b.timeLeft);

        return daysLeftA - daysLeftB;
      }
  
      return 0; 
    });
  
    if (this.selectedSortOrder === 'Descending') {
      this.similarProductsResponse.getSimilarItemsResponse.itemRecommendations.item.reverse();
    }
  }
  
  getDaysLeft(timeLeft: string): number {
    const daysMatch = timeLeft.match(/P(\d+)D/);
    if (daysMatch) {
      return parseInt(daysMatch[1], 10);
    }
    return 0;
  }

  getSimilarProducts(itemId: string) {
    console.log('curr item ID for similar products:', itemId);
    this.toggleTab('getSimilarProductsInfo');

    const apiUrl = `https://arushi-ebay-backend.wl.r.appspot.com/get-similar-products/${itemId}`;

    this.http.get(apiUrl).subscribe({
      next: (response) => {
      this.similarProductsResponse = response;
      console.log('Similar Products Response:', this.similarProductsResponse);
    },
    error:(error) => {
      console.error('Error:', error);
    }

  });
  }

  toggleShowMoreLess() {
    this.showMoreItems = !this.showMoreItems;
  }

  getShowMoreLessButtonText() {
    return this.showMoreItems ? "Show Less" : "Show More";
  }

  updateInputValidity() {
    this.isInputValid = false;
    if(this.searchQuery.locationChoice === 'current' && this.isKeywordsValid){
      this.isInputValid=true;
    }

    if(this.searchQuery.locationChoice === 'custom' && this.searchQuery.customLocation.trim().length === 5 && this.isKeywordsValid){
      this.isInputValid = true;
    }
  }
  backButton(){
    if(this.showWishlistInfoTab){
      this.showWishlist();
    }
    else{
      this.loadResults();
    }
  }
  loadResults() {
    const requestData = {
      keyword: this.searchQuery.keyword,
      category: this.searchQuery.category, 
      newCondition: this.searchQuery.newCondition,
      usedCondition: this.searchQuery.usedCondition,
      newConditionVal: this.searchQuery.newConditionVal,
      usedConditionVal: this.searchQuery.usedConditionVal,
      unspecifiedCondition: this.searchQuery.unspecifiedCondition,
      shippingLocal: this.searchQuery.shippingLocal,
      shippingFree: this.searchQuery.shippingFree,
      distance: this.searchQuery.distance,
      locationChoice: this.searchQuery.locationChoice,
      customLocation: this.searchQuery.customLocation,
    };
      
    if(requestData.usedCondition){
      requestData.usedConditionVal = 3000;
    }

    if(requestData.newCondition){
      requestData.newConditionVal = 1000;
    }

      this.showBothTab=true;
      this.shippingValues=[];
      this.submitButtonPressed = true;
      this.showProductInfoTab = false;
      this.noResults=false;

      const apiUrl = `https://arushi-ebay-backend.wl.r.appspot.com/get-all-data/${encodeURIComponent(requestData.keyword)}/${encodeURIComponent(requestData.category)}/${encodeURIComponent(requestData.shippingLocal)}/${encodeURIComponent(requestData.shippingFree)}/${encodeURIComponent(requestData.distance)}/${encodeURIComponent(requestData.customLocation)}/${encodeURIComponent(requestData.newConditionVal)}/${encodeURIComponent(requestData.usedConditionVal)}/`;

      this.http.get(apiUrl).subscribe(
      (response) => {
        this.responseData = response;
        this.items = this.responseData.findItemsAdvancedResponse[0].searchResult[0].item;
        
        if(this.responseData===undefined || this.items===undefined){
          this.noResults=true;
          this.submitButtonPressed=false;
          console.log("no results");
        }
        this.items.forEach((item: any) => {
          const shippingServiceCost = item.shippingInfo[0].shippingServiceCost[0]['__value__'];

          let shippingValue;

          if (shippingServiceCost === '0.0') {
            shippingValue = 'Free Shipping';
          } 
          else if (shippingServiceCost) {
            shippingValue = `$${shippingServiceCost}`;
          } 
          else {
            shippingValue = 'N/A';
          }

          this.shippingValues.push(shippingValue);
          const itemId = item.itemId[0]; 

          const apiUrl = `https://arushi-ebay-backend.wl.r.appspot.com/wishlist-status/${itemId}`;

          this.http.get(apiUrl).subscribe({
            next: (response) => {
              this.responseData = response;
              const wishlistStatus = this.responseData.wishlistStatus;
              this.wishlistStatus.set(itemId, wishlistStatus);
            },
            error: (error) => {
            }
          });
      
          
        });

        this.totalPages = Math.ceil(this.items.length / this.itemsPerPage);
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
        this.changePage(1);
        this.isKeywordsValid=true;
        this.isDataLoaded = true; 
        
      },
      (error) => {
      }
    );
    
  }  

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
  
    this.currentPage = page;
    this.paginatedItems = this.items.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );
  }

  getItem(myItemId: string){
    for(const myItem of this.items){

      if(myItem.itemId==myItemId){
        this.currItem=myItem;
      }

    }
  }


  getZipCodeSuggestions() {
    var zipCodeInput = (document.getElementById('customLocationInput') as HTMLInputElement).value;
  
    axios.get(`https://arushi-ebay-backend.wl.r.appspot.com/get-custom-zipcode/${zipCodeInput}`)
      .then(function (response) {
        var isInputValid = false
        var suggestions = response.data.postalCodes;
        var datalist = document.getElementById('zipSuggestions');
        if (datalist) {
          datalist.innerHTML = '';
  
          suggestions.forEach(function (suggestion: Suggestion) {
            var option = document.createElement('option');
            option.value = suggestion.postalCode;
            if (datalist) {
            datalist.appendChild(option);
            }
          });
        }
      })
      .catch(function (error) {
        console.error('Error fetching zip code suggestions:', error);
      });
  }

  getSingleItem(itemId: string) {
    this.toggleTab('getProductInfo');
    const apiUrl = `https://arushi-ebay-backend.wl.r.appspot.com/get-single-item-ebay/${itemId}`;

    this.http.get(apiUrl).subscribe({
      next: (response) => {

      this.responseData = response;
      this.singleItemsResponse = this.responseData.Item;

      this.submitButtonPressed = false;
      this.showProductInfoTab = true;
      this.getProductInfo=true;
      this.isProductDetailsAvailable =true;
      
      this.currItemId=itemId;
      this.getItem(this.currItemId);

      this.items.forEach((item: any) => {
        const shippingServiceCost = item.shippingInfo[0].shippingServiceCost[0]['__value__'];

        let shippingValue;

        if (shippingServiceCost === '0.0') {
          shippingValue = 'Free Shipping';
        } 
        else if (shippingServiceCost) {
          shippingValue = `$${shippingServiceCost}`;
        } 
        else {
          shippingValue = 'N/A';
        }
        if(item.itemId==this.currItemId){
          this.currShippingPrice = shippingValue;
        }

        this.shippingValues.push(shippingValue);

      });
    },
    error:(error) => {
    }

  });

  this.showResultsInfoTab = false;
  this.showWishlistInfoTab = false;
  this.showBothTab = false;
  }
  
  clearForm() {
    this.searchQuery = {
      keyword: '',
      category: '0',
      newCondition: false,
      usedCondition: false,
      newConditionVal: 0,
      usedConditionVal: 0,
      unspecifiedCondition: false,
      shippingLocal: false,
      shippingFree: false,
      distance: 0,
      locationChoice: 'current',
      customLocation: '',
      customLocationInput: '',
    };
  }

  getCurrentLocation(){
    axios.get(`https://ipinfo.io/json?token=9fbbef71c8b469`)
      .then( (response) => {
        this.searchQuery.customLocation=response.data.postal;
      })
      .catch(function (error) {
        console.error('Error fetching current zip code:', error);
      });
      this.updateInputValidity()
  }

  wishlistToggle(itemId: string, title: string, galleryURL: string, currentPrice: string, shippingServiceCost: string ) {
    const apiUrl = `https://arushi-ebay-backend.wl.r.appspot.com/wishlist-status/${itemId}`;
    
    this.http.get(apiUrl).subscribe({
      next: (response) => {
        this.responseData = response;
        const wishlistStatus = this.responseData.wishlistStatus;
        this.wishlistStatus.set(itemId, wishlistStatus);

        if (wishlistStatus) {
          this.wishlistRemove(itemId);
        } 
        else {
          this.wishlistAdd(itemId, title, galleryURL, currentPrice, shippingServiceCost);
        }
        this.loadResults();
      },
      error: (error) => {
      }
    });
  }

  wishlistAdd(itemId: string, title: string, galleryURL: string, currentPrice: string, shippingServiceCost: string) {
   const requestData = { itemId , title, galleryURL, currentPrice, shippingServiceCost};
  
   const apiUrl = `https://arushi-ebay-backend.wl.r.appspot.com/wishlist-add/${encodeURIComponent(galleryURL)}/${encodeURIComponent(title)}/${encodeURIComponent(shippingServiceCost)}/${encodeURIComponent(currentPrice)}/${encodeURIComponent(itemId)}`;

   this.http.get(apiUrl).subscribe({
      next: (response) => {
        this.wishlistStatus.set(itemId, true);
      },
      error: (error) => {
      }
    });
  }

  wishlistRemove(itemId: string) {
    const requestData = { itemId };

    const apiUrl = `https://arushi-ebay-backend.wl.r.appspot.com/wishlist-remove/${itemId}`;
    this.http.get(apiUrl).subscribe({
      next: (response) => {
        console.log('Response from the backend:', response);
        this.wishlistStatus.set(itemId, false);
      },
      error :(error) => {
      }
    });
  }

  wishlistAll() {
    this.http.get<any[]>(`https://arushi-ebay-backend.wl.r.appspot.com/wishlist-get-all`).subscribe({
      next: (response) => {
        this.wishlistAllItems = response;
        console.log(this.wishlistAllItems);
      },
      error: (error) => {
      }
    });
  }

  getGoogleImages(GoogleTitle: string){
    this.toggleTab('getPhotosInfo');
    const apiUrl = `https://arushi-ebay-backend.wl.r.appspot.com/get-google-search-images/${encodeURIComponent(GoogleTitle)}`;
    
    this.http.get(apiUrl).subscribe({
      next: (response) => {
        this.googleResultItems = response;
      },
      error: (error) => {
      }
    });
  }
  
}