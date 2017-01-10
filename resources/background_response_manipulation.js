/* ╔════════════════════════════════════════╗
   ║ background_response_manipulation       ║
   ╟────────────────────────────────────────╢
   ║                                        ║
   ╚════════════════════════════════════════╝
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ */

regex_stalewhile   = /stale-while-revalidate/i;
regex_staleiferror = /stale-if-error/i;
regex_firstcomma   = /^\,/;

chrome.webRequest.onHeadersReceived.addListener(function(response){
  headers = response.responseHeaders.reduce(function(carry,item){ carry[ item.name.toLowerCase() ] = item.value; return carry; },{});   /* temporary format */
  /*--*/
  var is_exist_cachecontrol   = -1 !== Object.keys(headers).indexOf("cache-control");
  var is_exist_stale          = (true === is_exist_cachecontrol) && 
                                (true === regex_stalewhile.test(headers["cache-control"]) || true === regex_staleiferror.test(headers["cache-control"]));

  if(true === is_exist_stale) return response;                                                                           //some stale definition already exist, do nothing.
  headers["cache-control"] = headers["cache-control"] + ",stale-while-revalidate=86400,stale-if-error=259200";           //append stale instructions.
  headers["cache-control"] = headers["cache-control"].replace(regex_firstcomma, "");                                     //if headers is empty or something, prevent 'comma' hanging at first. 

  /*--*/
  response.responseHeaders = Object.keys(headers).map(function(name){ return {"name":name, "value": headers[name]}; });  //override (*just local variable), other existing values kept.
  return response;
}, {"urls": ["*://*/*"]}, ["blocking", "responseHeaders"]);
