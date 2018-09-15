const http=require('http');
const request=require('request');

module.exports={
    getSubredditsByTop: function getSubredditsByTop(subreddit, limit){
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
    },

    getCommentsByTop: function getCommentsByTop(subreddit, post, limit){
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
    },

    importText: function importText(subreddit, num_posts, num_comments){
    postRequest=this.getSubredditsByTop(subreddit, num_posts);
    postRequests=postRequest.then((resolution) => {
                posts=[]
                comments=[]
                for (var i=0; i<resolution.length; i++){
                    posts.push([resolution[i]['data']['title'], resolution[i]['data']['id']]);
                    comments.push(this.getCommentsByTop(subreddit, resolution[i]['data']['id'], num_comments));
                }
                return [posts,comments]; //formatted as [list of [title,id], [comment_json]]
            }).then((resolution)=>{
                return Promise.all(resolution[1]).then((vals)=>{
                    var text="";
                    for (var i=0; i<num_posts; i++){
                        //only allows top-level comments, high level replies are nested further in
                        //console.log(vals[i][1]['data']['children'][j]['data']['body'])
                        for (var j=0; j<num_comments; j++){
                            //i: post index, j: comment index
                            try{
                                cur_text=vals[i][1]['data']['children'][j]['data']['body'];
                                // The API returns invalid comments as "undefined" strings
                                if (cur_text!="undefined"){
                                    text+=cur_text+". ";
                                }
                                //console.log(vals[i][1]['data']['children'][j]['data']['body']);
                            }
                            catch(e){
                            };
                        }
                    }
                    return [resolution[0], text];
                })
            }).catch((failure)=>{
                console.log("err: failure in importText() in reddit.js");
            });
    return postRequests
    }
};