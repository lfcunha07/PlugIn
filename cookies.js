let firstCookies = 0;
let thirdCookies = 0;
let totalStorage = 0;

function showCookiesForTab(tabs) 
{
  //variables for cookie lists
  let firstPartyCookieList = document.getElementById('first-party-cookie-list');
  let firstPartySafe = 0;
  let firstPartyCookies = 0;
  let thirdPartyCookieList = document.getElementById('third-party-cookie-list');
  let thirdPartyCookies = 0;
  let thirdPartySafe = 0;
  let firstPartyCookieNames = [];

  
  //get all first party cookies
  let currentQuery = browser.tabs.query({active: true}).then((currentQuery) => { 
    let currentUrl = (currentQuery[0])["url"];
    browser.cookies.getAll({url: currentUrl}).then((cookies) => {
      if (cookies.length > 0) {
        //add an <li> item with the name and value of the cookie to the list
        for (let cookie of cookies) {
          if(cookie.secure){
            firstPartySafe += 1;
          }
          firstPartyCookies += 1;
          firstPartyCookieNames.push(cookie.name);
          let li = document.createElement("li");
          let content = document.createTextNode(firstPartyCookies + ". " + cookie.name + " ==> " + cookie.domain + " (Secure: " + cookie.secure + " | Session: " + cookie.session + ")");
          li.appendChild(content);
          firstPartyCookieList.appendChild(li);
        }
      } else {
        let p = document.createElement("p");
        let content = document.createTextNode("No cookies in this tab.");
        let parent = firstPartyCookieList.parentNode;

        p.appendChild(content);
        parent.appendChild(p);
      }
      firstCookies = firstPartyCookies;
    }).then(() => {
      //get all third party cookies
      browser.cookies.getAll({partitionKey : {topLevelSite : currentUrl}}).then((cookies) => {
        if (cookies.length > 0) {
          //add an <li> item with the name and value of the cookie to the list
          for (let cookie of cookies) {
            if(cookie.secure){
              thirdPartySafe += 1;
            }
            console.log(cookie)
            thirdPartyCookies += 1;
            let li = document.createElement("li");
            let content = document.createTextNode(thirdPartyCookies + ". " + cookie.name + " ==> " + cookie.domain + " (Secure: " + cookie.secure + " | Session: " + cookie.session + ")");
            li.appendChild(content);
            thirdPartyCookieList.appendChild(li);
          }
        } else {
          let p = document.createElement("p");
          let content = document.createTextNode("No cookies in this tab.");
          let parent = thirdPartyCookieList.parentNode;
          p.appendChild(content);
          parent.appendChild(p);
        }
        thirdCookies = thirdPartyCookies;
      }).then(() => {;
        }).then(() => {
        //set the header and variables
        let activeTabUrl = document.getElementById('header-title');
        let text = document.createTextNode("Dados da Página");
        let summary = document.getElementById('summary');
        activeTabUrl.appendChild(text);

        //finalize summary
        let total_cookies = firstPartyCookies + thirdPartyCookies;
        let h3 = document.createElement("h3");
        security = firstPartySafe+thirdPartySafe/total_cookies * 100;
        let summaryContent = document.createTextNode("Cookies Injetados: " + total_cookies + " | 1st Party: " + firstPartyCookies + " | 3rd Party: " + thirdPartyCookies);
        h3.appendChild(summaryContent);
        summary.appendChild(h3);
      });
    });
  });
}

function showStorageForTab(storage) {
  if (storage.length > 0) {
    let localStorageList = document.getElementById('local-storage-list');
    for (let i in storage) {
      let item = storage[i];
      let li = document.createElement("li");
      let content = document.createTextNode(item);
      li.appendChild(content);
      localStorageList.appendChild(li);
      totalStorage += 1;
    }
  }
}


function showScoreForTab(fpc, tpc, storage) {
  let cookie_val = (fpc+tpc)/50.0;
  if(cookie_val >= 1){
    cookie_val = 1;
  }
  let total_storage = storage/50.0;
  if(total_storage >= 1){
    total_storage = 1;
  }
  let total = (fpc/(fpc+tpc)*0.33 + total_storage*0.33 + cookie_val*0.33)*100;
  let footer = document.getElementById('score');
  let h5 = document.createElement("h5");
  let footerContent = document.createTextNode("Page Score: " + total.toFixed(2) + "%");
  h5.appendChild(footerContent);
  footer.appendChild(h5)

}

//get active tab to run an callback function.
//it sends to our callback an array of tab objects
function getActiveTab() 
{
  return browser.tabs.query({currentWindow: true});
}

getActiveTab().then(showCookiesForTab).then(() => {
  browser.tabs.executeScript({
    file: "background.js"
    }).then((values) => {
      showStorageForTab(values[0]);
  }).then(() => {
    showScoreForTab(firstCookies,thirdCookies,totalStorage);
  });
});

