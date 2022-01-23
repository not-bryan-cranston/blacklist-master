# blacklist-master

low effort RSS feed generator for a user feed from gab.com

built on deno while watching youtube


### how to run

```
deno run --allow-net main.ts
```
then visit http://localhost:8080/<user name> to generate an rss of their latest posts

or deploy to https://deno.com/deploy/docs/deployments

### todo:
- clean up code
- check on dockerfile
- better structure content to account for reblog + quotes
- include videos