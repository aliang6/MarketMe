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
                comments=[]
                for (var i=0; i<resolution.length; i++){
                    comments.push(this.getCommentsByTop(subreddit, resolution[i]['data']['id'], num_comments));
                }
                return comments;
            }).then((resolution)=>{
                return Promise.all(resolution).then((vals)=>{
                    var text="";
                    for (var i=0; i<num_posts; i++){
                        //only seems to allow top-level comments
                        //console.log(vals[i][1]['data']['children'][j]['data']['body'])
                        for (var j=0; j<num_comments; j++){
                            //i: post index, j: comment index
                            try{
                                cur_text=vals[i][1]['data']['children'][j]['data']['body'];
                                if (cur_text!="undefined"){
                                    text+=cur_text+". ";
                                }
                                //console.log(vals[i][1]['data']['children'][j]['data']['body']);
                            }
                            catch(e){
                            };
                            /*
                            try{
                                text+=vals[i][1]['data']['children'][0]['data']['children']+". ";
                                //console.log(vals[i][1]['data']['children'][0]['data']['children']);
                            }
                            catch(e){
                            };*/
                        }
                    }
                    //console.log(text);
                    return text;
                })
            }).catch((failure)=>{
                console.log("err: failure in importText() in reddit.js");
            });
    return postRequests
    }
};