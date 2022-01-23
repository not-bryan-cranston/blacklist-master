import { serve } from "https://deno.land/std@0.122.0/http/server.ts";
import { stringify } from "https://deno.land/x/xml@2.0.3/mod.ts";

const port = 8080;

const handler = async (request: Request): Promise<Response> => {
    const url = new URL(request.url)
    if (url.pathname === '/'){
        return new Response(`
        <html>
        <body>
<a href="https://github.com/not-bryan-cranston/blacklist-master">https://github.com/not-bryan-cranston/blacklist-master</a>
        </body>
        </html>
        `, { status: 200 });
    } else if (url.pathname === '/favicon.ico'){
        return new Response(`
       
        `, { status: 200 });
    }
    else {
       const username =  url.pathname.split('/')[1].split('.')[0]

       const f = await fetch("https://gab.com/api/v1/account_by_username/"+username, {
        // "credentials": "include",
        "headers": {
            "User-Agent": "not-bryan-cranston/blacklist-master-0.1",
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "en-US,en;q=0.5",
            // "X-CSRF-Token": "4gWSACnyj6/Ojkd1rH6I6+d5vpPEZJhz/j4YV9i7RuZ6paAZX5kXyBtLmhLLvsrWYZ0wZmTWwf1OrMiA9GctSA==",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin"
        },
        // "referrer": "https://gab.com/",
        "method": "GET",
        // "mode": "cors"
    });
   

    const user = await f.json()
    if(user.error){
        //Record not found
     return new Response('errpr'+user.error,{status:500})   
    }
      const ff =  await fetch(`https://gab.com/api/v1/accounts/${user.id}/statuses?exclude_replies=true`, {
    // "credentials": "include",
    "headers": {
        "User-Agent": "not-bryan-cranston/blacklist-master-0.1",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.5",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin"
    },
    // "referrer": "https://gab.com/",
    "method": "GET",
    // "mode": "cors"
});
const items = await ff.json()
if(items.error){
    return new Response(items.error,{status:500})   
    
}
const body = stringify({
    rss:{
       '@xmlns:atom':'http://www.w3.org/2005/Atom' ,
       '@version':'2.0',
       channel:{
        title: username,
        description:`latest posts from ${username}`,
        link:'https://gab.com/'+username,
        pubDate: new Date().toUTCString(),
        lastBuildDate:new Date().toUTCString(),
        generator: 'not-bryan-cranston/blacklist-master',
        item: items
        .filter((x:any) => !x.reblog)
        .map((item:any) => ({
            title: item.content.slice(0,140),
            description: (`${item.content || ''}
            ${item.media_attachments.filter((a:any) => a.type === 'image').map((a:any) => `<img src="${a.preview_url}" />`)}

            ${item.quote?.content || ''}
            ${item.quote?.media_attachments.filter((a:any) => a.type === 'image').map((a:any) => `<img src="${a.preview_url}" />`) || ''}

            ${item.reblog?.content || ''}
            ${item.reblog?.media_attachments.filter((a:any) => a.type === 'image').map((a:any) => `<img src="${a.preview_url}" />`) || ''}

            `),
            pubDate: new Date(item.created_at).toUTCString(), 
            link: item.url,
            guid:item.url,
            
        })),
        
       }
    }
},{replacer:({value})=>value})
const headers = new Headers();
headers.append('content-type','application/rss+xml')

       return new Response(body, { status: 200, headers });
    }

};

console.log(`HTTP webserver running. Access it at: http://localhost:8080/`);
await serve(handler, { port });