//var to hold db connection
let db;

// establish connection called budget_tracker with IndexedDB
const request = indexedDB.open('budget_tracker', 1)

//check for db version changed
request.onupgradeneeded = function(event) {
    //save reference to database
    const db = event.target.result;

    //create object store
    db.createObjectStore('new_money_transaction', { autoIncrement: true });
}

request.onsuccess = function(event) {
    db = event.target.result;

    if(navigator.onLine) {
        uploadMoneyTransaction();       
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};

//submit transaction without internet connection
function saveRecord(record) {
    //open new transaction
    const transaction = db.transaction(['new_money_transaction'], 'readwrite');
    //access object store
    const moneyTransactionObjectStore = transaction.objectStore('new_money_transaction');
    //add record to store
    moneyTransactionObjectStore.add(record);
}

function uploadMoneyTransaction()  {
    const transaction = db.transaction(['new_money_transaction'], 'readwrite');
    const moneyTransactionObjectStore = transaction.objectStore('new_money_transaction');

    const getAll = moneyTransactionObjectStore.getAll();

    //getAll records from store / set to variable
    getAll.onsuccess = function() {
        if(getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if(serverResponse.message){
                        throw new Error(serverResponse);
                    }
                    const transaction = db.transaction(['new_money_transaction'], 'readwrite');
                    const moneyTransactionObjectStore = transaction.objectStore('new_money_transaction');
                    moneyTransactionObjectStore.clear();

                    alert('All saved money transactions have been submitted!');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }
}

//listen for app
window.addEventListener('online', uploadMoneyTransaction);