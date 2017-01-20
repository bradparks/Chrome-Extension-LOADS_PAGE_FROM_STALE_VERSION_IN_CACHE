/* ╔════════════════════════════════════════╗
   ║ background_response_manipulation       ║
   ╟────────────────────────────────────────╢
   ║                                        ║
   ╚════════════════════════════════════════╝
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ */

regex_stalewhile   = /stale-while-revalidate/i;
regex_staleiferror = /stale-if-error/i;
regex_firstcomma   = /^\,/;
regex_doublecomma   = /,,+/g;

function headers_handler(response){
  // extract original
  var is_edited = false;

  response.responseHeaders.forEach(function(item, index){
    if("cache-control" !== item.name.toLowerCase())   return;

    if(false === regex_stalewhile.test(item.value))   item.value += ",stale-while-revalidate=86400";  //edit existing
    if(false === regex_staleiferror.test(item.value)) item.value += ",stale-if-error=259200";

    item.value = item.value.replace(regex_firstcomma, "").replace(regex_doublecomma, "");  //fix

    is_edited = true;  //if false, there was no cache-control header
  });
  
  if(false === is_edited) response.responseHeaders.push({name:"cache-control", value: "stale-while-revalidate=86400,stale-if-error=259200"});

  return {"responseHeaders": response.responseHeaders};
}

filters   = {urls:  ["<all_urls>"]
          //,types: ["main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object"]                                         /*original set*/
            ,types: ["main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object",                   "ping", "other"]      /*all but not xhr, always keep the xhr most-updated...*/
          //,types: ["main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "other"]      /* Chrome max value:   https://developer.chrome.com/extensions/webRequest -- other might be ["xbl", "xslt", "beacon", "xml_dtd", "media", "websocket", "csp_report", "imageset", "web_manifest"] from: Mozilla max value:  https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/webRequest/ResourceType */
            };
info_spec = ["responseHeaders", "blocking"];

chrome.webRequest.onHeadersReceived.addListener(headers_handler, filters, info_spec);

/*
chrome.webRequest.onResponseStarted.addListener(function(response){ console.log(response); }, filters, ["responseHeaders"]);   //https://developer.chrome.com/extensions/webRequest#event-onResponseStarted     //for debugging - will shows (readonly) the final version of the response-headers, after modified by ALL the extensions.
chrome.webRequest.onErrorOccurred.addListener(function(response){   console.log(response); }, filters);                        //https://developer.chrome.com/extensions/webRequest#event-onErrorOccurred       //will mostly show the uBlock-Origin net::request blocked messages.
chrome.webRequest.onCompleted.addListener(function(response){       console.log(response); }, filters);                        //https://developer.chrome.com/extensions/webRequest#event-onCompleted
*/