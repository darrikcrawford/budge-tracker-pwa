//var to hold db connection
let db;

// establish connection called budget_tracker with IndexedDB and set it to version 1
const request = indexedDB.open('budget_tracker', 1)

//check if db version changed
request.onupgradeneeded = function(event) {
    //save reference to the database
    const db = event.target.result;

    //create an object store
    db.createObjectStore('new_money_transaction', { autoIncrement: true });
}

//upon a successful
request.onsuccess = function(event) {
    db = event.target.result;

    if(navigator.onLine) {
        uploadMoneyTransaction();       
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};