"use strict";

self.addEventListener("notificationclick",event=>{
  event.notification.close();
  const data=event.notification.data||{};
  event.waitUntil((async()=>{
    const windows=await self.clients.matchAll({type:"window",includeUncontrolled:true});
    for(const client of windows){
      if("focus" in client){
        client.postMessage({type:"cardbase:open-trades",tradeId:data.tradeId||null});
        await client.focus();
        return;
      }
    }
    if(self.clients.openWindow){
      await self.clients.openWindow("./?open=trades");
    }
  })());
});
