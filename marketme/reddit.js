const http=require('http');
const request=require('request');
const port=8008

var getSubredditByTop = function getSubByTop(subreddit, limit){
    var timeframe ='all';
    var redditRequest = new Promise(
        (resolve, reject) => {
            request(`http://reddit.com/r/${subreddit}/top.json?t=${timeframe}&limit=${limit}`,
            { json: true},
            (err, rsp, body)=>{
                if (err) { return console.log(err)};
                resolve(body.data.children);
            });
        });
    return redditRequest;
};

var getCommentsByTop = function getCommentsByTop(subreddit, post, limit){
    var redditRequest = new Promise(
        (resolve, reject) => {
            console.log(`http://reddit.com/r/${subreddit}/comments/${post}.json?limit=${limit}`);
            request(`http://reddit.com/r/${subreddit}/comments/${post}.json?limit=${limit}`,
                { json: true},
                (err, rsp, body)=>{
                    if (err) {return console.log(err)};
                    resolve(body);
                });
        });
    return redditRequest;
};

var requestHandler = (request,response) => {
    var subreddit="bboy";
    var num_posts=10;
    var num_comments=10;

    postRequest=getSubredditByTop(subreddit, num_posts);
    postRequests=postRequest.then((resolution) => {
                comments=[]
                for (var i=0; i<resolution.length; i++){
                    comments.push(getCommentsByTop(subreddit, resolution[i]['data']['id'], num_comments));
                }
                return comments;
            }).then((resolution)=>{
                Promise.all(resolution).then((vals)=>{
                    for (var i=0; i<num_posts; i++){
                        //only seems to allow top-level comments
                        //console.log(vals[i][1]['data']['children'][j]['data']['body'])
                        for (var j=0; j<num_comments; j++){
                            //i: post index, j: comment index
                            try{
                                console.log(vals[i][1]['data']['children'][j]['data']['body']);
                            }
                            catch(e){
                            };
                        }
                    }
                })
            }).catch((failure)=>{
                console.log("ERR: comment failure");
            });
}

const server=http.createServer(requestHandler);

server.listen(port, (err) => {
    if (err) {
        return console.log("error",err)
    }
    console.log(`server listening on ${port}`);
});