if (!window.indexedDB) {
  console.log("Your browser doesn't support a stable version of IndexedDB.");
} else {
  const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

  let db;
  const request = indexedDB.open("offlineTransactions", 1);
 
  request.onerror = (event) => {
    console.log('error: ', event.target.errorCode);
  };

  request.onsuccess = (req) => {
    db = req.result;
    console.log('onsuccess: ', db)
  
    if (navigator.onLine) {
      console.log('connected: ...')
      pushToDB();
    }
  };
  
  request.onupgradeneeded = (req) => {
    // var db = event.target.result;
    let db = event.req.result;
    db.createObjectStore("offlineRequest", { autoIncrement: true });
    console.log('onupgradeneeded: ', db)
  };
  
  // Read in Index.js
  //was add()
  const saveRecord = (item) => {
    const transaction = db.transaction(["offlineRequest"], "readwrite")
      .objectStore("offlineRequest")
      .add(item);

    transaction.onsuccess = (event) => console.log(`${item} added successfully!`);
    transaction.onerror = (event) => console.log(`Failed to add ${item}.`)
  }
  
  const pushToDB = () => {
    const transaction = db.transaction(["offlineRequest"], "readwrite")
      .objectStore("offlineRequest")
      .getAll();

    transaction.onsuccess = () => {
      console.log('transactionresult: ', transaction.result)
      if (transaction.result.length > 0) {

        fetch("/api/transaction/bulk", {
          method: "POST",
          body: JSON.stringify(transaction.result),
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json"
          }
        })
        .then(response => response.json())
        .then(() => {
          db.transaction(["offlineRequest"], "readwrite")
            .objectStore('offlineRequest')
            .clear();
        });
      }
    };
    transaction.onerror = (event) => console.log(`Failed to push to DB.`)
  }
  
  window.addEventListener('online', pushToDB);
}
