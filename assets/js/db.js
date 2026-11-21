/* Gallery Baran local database: IndexedDB stores artwork files and personal records. */
(function(){
  const DB_NAME='galleryBaranDB', DB_VERSION=1;
  let dbPromise;
  function openDB(){
    if(dbPromise) return dbPromise;
    dbPromise=new Promise((resolve,reject)=>{
      const req=indexedDB.open(DB_NAME,DB_VERSION);
      req.onupgradeneeded=()=>{
        const db=req.result;
        ['artworks','ideas','journal','wip','inspiration','collections','messages'].forEach(name=>{
          if(!db.objectStoreNames.contains(name)) db.createObjectStore(name,{keyPath:'id'});
        });
      };
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error);
    });
    return dbPromise;
  }
  async function all(store){
    const db=await openDB();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(store,'readonly'), req=tx.objectStore(store).getAll();
      req.onsuccess=()=>resolve(req.result||[]);
      req.onerror=()=>reject(req.error);
    });
  }
  async function put(store,item){
    const db=await openDB();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(store,'readwrite');
      tx.objectStore(store).put(item);
      tx.oncomplete=()=>resolve(item);
      tx.onerror=()=>reject(tx.error);
    });
  }
  async function remove(store,id){
    const db=await openDB();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(store,'readwrite');tx.objectStore(store).delete(id);
      tx.oncomplete=()=>resolve(true);tx.onerror=()=>reject(tx.error);
    });
  }
  async function clearAll(){
    const db=await openDB();
    return new Promise((resolve,reject)=>{
      const names=['artworks','ideas','journal','wip','inspiration','collections','messages'];
      const tx=db.transaction(names,'readwrite');names.forEach(n=>tx.objectStore(n).clear());
      tx.oncomplete=()=>resolve(true);tx.onerror=()=>reject(tx.error);
    });
  }
  window.BarANDB={all,put,remove,clearAll,openDB};
})();