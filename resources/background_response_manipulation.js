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
            ,types: ["main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object"]
            };
info_spec = ["responseHeaders", "blocking"];

chrome.webRequest.onHeadersReceived.addListener(headers_handler, filters, info_spec);

/*
//for debugging - will shows (readonly) the final version of the response-headers, after modified by ALL the extensions.
chrome.webRequest.onResponseStarted.addListener(function(response){ console.log(response); }, filters, ["responseHeaders"]);
*/