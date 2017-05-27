import React, { Component } from 'react';
import logo from './logo.svg';

import Cookies from 'js-cookie';
import Spinner from './component/Spinner';
import './css/App.css';

class App extends Component {
  constructor(props){
    super(props);
    // state {if the value is not used in render it should not be in state}
    this.state = {feed: null, oldFeed: null, filteredCoins: typeof Cookies.get('filteredCoins') === 'undefined' ? '' : Cookies.get('filteredCoins') };

    // init load
    this.loadFeed();

    // bind this to functions
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  componentDidMount(){
    // save so you can clear this interval later - load data every 15 seconds
    this.streamId = setInterval(this.loadFeed.bind(this), 15000);
  }

  componentWillUnmount(){
    clearInterval(this.streamId);
  }

  /**
   * get coinmarket feed data
   * @return {[type]} [description]
   */
  loadFeed(){
    console.log('getting feed data');
    let xhttp = new XMLHttpRequest();
    let self = this;
    xhttp.onreadystatechange = function() {
      if (this.readyState === 4 && this.status === 200) {
        if(self.state.feed !== null){
          self.setState({oldFeed: self.state.feed});
        }
        let filteredFeed = self.filterCoins(JSON.parse(this.responseText));
        console.log(filteredFeed);
        self.setState({feed: filteredFeed});
      }
    };
    xhttp.open("GET", "https://api.coinmarketcap.com/v1/ticker/", true);
    xhttp.send()
  }

  /**
   * returned filtered coin data - if there is no prefrence return top 10 coins
   * @param  {[type]} coins         [all coins]
   * @param  {[type]} filteredCoins [coins to get]
   * @return {[type]}               [description]
   */
  filterCoins(coins){
    let filteredCoins = Cookies.get('filteredCoins');
    if(typeof filteredCoins === 'undefined' || filteredCoins.replace(' ', '') === ""){
      return coins.filter(function(coin){
        for (var i = 0; i < 9; i++) {
          if(coin.rank == i+1){
              return 1;
          }
        }
        return 0;
      });
    }else{
      filteredCoins = filteredCoins.replace(' ', '').split(',');
      return coins.filter(function(coin){
        for (var i = 0; i < filteredCoins.length; i++) {
          if(filteredCoins[i].toUpperCase() === coin.symbol){
            return 1;
          }
        }
        return 0;
      });
    }
  }

  /**
   * check 1 hour change return green if its positive red otherwise
   * @param  {[type]} feed    [new feed]
   * @param  {[type]} oldFeed
   * @return {[type]}  string
   */
  getColorChange(feed){
      if(feed.percent_change_1h > 0){
        return "green";
      }else{
        return "red";
      }
  }

  /**
   * save filter preference in cookie
   * @param  {[type]} event [description]
   * @return {[type]}       [description]
   */
  handleSubmit(event){
    event.preventDefault();
    // save coins to filter in a cookie
    Cookies.set('filteredCoins', this.state.filteredCoins, {expires: 364});
    this.loadFeed();

  }


  handleInputChange(event){
    this.setState({filteredCoins: event.target.value})
  }


  renderSpinners(){
    if(this.state.feed !== null){
      let feed = this.state.feed;
      let oldFeed = this.state.oldFeed;
      let color = "green";
      let getColorChange = this.getColorChange;
      return feed.map(function(feed, i){

        // if its a positive change flash green otherwise red
        color = getColorChange(feed);
        let holdings = (<p>hold: ${typeof Cookies.get(feed.id) === 'undefined'? 0 : Cookies.get(feed.id)*feed.price_usd}</p>);
        return(
          <li key={i}>
          <Spinner size="250px" color={color} borderWidth="8px">
            <h1>{feed.name}</h1>
            <h3>{feed.price_usd}</h3>

            <p>1h: <span id="hour">{feed.percent_change_1h}</span></p>
            <p>24h: <span id="day">{feed.percent_change_24h}</span></p>
            <p>7d: <span id="day7">{feed.percent_change_7d}</span></p>
            {holdings}
          </Spinner>
          </li>
        );
      });
    }
  }
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Welcome to React</h2>
          <form onSubmit={this.handleSubmit}>
            <input type="text" onChange={this.handleInputChange} value={this.state.filteredCoins}/>
            <input type="submit" value="Submit" />
          </form>
        </div>
        <ul>
        {this.renderSpinners()}
        </ul>
      </div>
    );
  }
}

export default App;