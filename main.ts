import { serve } from "https://deno.land/std@0.122.0/http/server.ts";
import { stringify } from "https://deno.land/x/xml@2.0.3/mod.ts";

const port = 8080;

const handler = async (request: Request): Promise<Response> => {
    const url = new URL(request.url)
    if (url.pathname === '/'){
        return new Response(`
        <html>
        <body>
            <h1>TEST PAGE!</h1>
        </body>
        </html>
        `, { status: 200 });
    } else if (url.pathname === '/favicon.ico'){
        return new Response(`
        <html>
        <body>
            <h1>TEST PAGE!</h1>
        </body>
        </html>
        `, { status: 200 });
    }
    else {
       const username =  url.pathname.split('/')[1].split('.')[0]
       console.log(username)

       const f = await fetch("https://gab.com/api/v1/account_by_username/"+username, {
        "credentials": "include",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; rv:91.0) Gecko/20100101 Firefox/91.0",
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "en-US,en;q=0.5",
            // "X-CSRF-Token": "4gWSACnyj6/Ojkd1rH6I6+d5vpPEZJhz/j4YV9i7RuZ6paAZX5kXyBtLmhLLvsrWYZ0wZmTWwf1OrMiA9GctSA==",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin"
        },
        "referrer": "https://gab.com/",
        "method": "GET",
        "mode": "cors"
    });
   

    const user = await f.json()
    if(user.error){
        //Record not found
     return new Response('errpr'+user.error,{status:500})   
    }
      const ff =  await fetch(`https://gab.com/api/v1/accounts/${user.id}/statuses?exclude_replies=true`, {
    "credentials": "include",
    "headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; rv:91.0) Gecko/20100101 Firefox/91.0",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.5",
        // "X-CSRF-Token": "0WT0Evxnx/9zTM14xDwWdLPh4Fk1z1NN4Q4SdJqlznpJxMYLigxfmKaJEB+j/FRJNQVurJV9CsNRnMKjtnml1A==",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin"
    },
    "referrer": "https://gab.com/",
    "method": "GET",
    "mode": "cors"
});
const items = await ff.json()
if(items.error){
    return new Response(items.error,{status:500})   
    
}
console.log(items.length)
const body = stringify({
    rss:{
       '@xmlns:atom':'http://www.w3.org/2005/Atom' ,
       '@version':'2.0',
       channel:{
        title: username,
        description:`latest posts from ${username}`,
        link:'https://gab.com/'+username,
        pubDate: new Date(),
        lastBuildDate:new Date(),
        generator: 'foooo',
        item: items.map((item:any) => ({
            title: item.content.slice(0,140),
            description: decodeURI(`item.content ${item.content}
            item.quote?.content ${item.quote?.content || ''}
            item.reblog?.content ${item.reblog?.content || ''}
            item.reblog?.quote?.content ${item.reblog?.quote?.content || ''}
            `),
            pubDate: item.created_at, 
            link: item.url,
            guid:item.id,
            
        })),
        // <link>https://ramsay.xyz/</link>
        // <atom:link href="https://ramsay.xyz/feed.xml" rel="self" type="application/rss+xml"/>
        // <pubDate>Wed, 05 Jan 2022 21:33:58 -0600</pubDate>
        // <lastBuildDate>Wed, 05 Jan 2022 21:33:58 -0600</lastBuildDate>
        // <generator>Jekyll v4.2.0</generator>
       }
    }
},{replacer:({value})=>value})
const headers = new Headers();
headers.append('content-type','application/rss+xml')

       return new Response(`<?xml version="1.0" encoding="UTF-8"?>
       <rss xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
       <channel>
<title>Simon Ramsay</title>
<description>A personal blog about shitty infrequent random programing tips</description>
<link>https://ramsay.xyz/</link>
<atom:link href="https://ramsay.xyz/feed.xml" rel="self" type="application/rss+xml"/>
<pubDate>Wed, 05 Jan 2022 21:33:58 -0600</pubDate>
<lastBuildDate>Wed, 05 Jan 2022 21:33:58 -0600</lastBuildDate>
<generator>Jekyll v4.2.0</generator>
${items.map((item:any)=>`<item>
<title>item.content.slice(0,140)</title>
            <description>
            ${`item.content ${item.content}
            item.quote?.content ${item.quote?.content || ''}
            item.reblog?.content ${item.reblog?.content || ''}
            item.reblog?.quote?.content ${item.reblog?.quote?.content || ''}
            `}
            </description>
            <pubDate>${item.created_at}</pubDate>
            <link>${item.url}</link>
            <guid>${item.id}</guid>
</item>
`)}
</channel>
</rss>
`, { status: 200, headers });
    }

};

console.log(`HTTP webserver running. Access it at: http://localhost:8080/`);
await serve(handler, { port });