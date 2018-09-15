const http = require('http');
const port = 7999;
const request = require('request');
require('dotenv').config();

var getSynonyms = function getSynonyms(target, limit){
    var key=process.env.THESAURUS_API_KEY;
    var url=`http://words.bighugelabs.com/api/2/${key}/${target}/json`;
    console.log(url);
    var thesaurusRequest=new Promise((resolve, reject)=>{
        request(url, { json:true},
        (err,rsp,body)=>{
            if (err) {resolve(console.log(err))};
            if (rsp.statusCode==200) {
                var synonyms=[];
                for (part_of_speech in body){
                    synonyms=synonyms.concat(body[part_of_speech].syn);
                }
                synonyms.sort(function(a,b){
                    return a.length - b.length;
                });
                console.log(synonyms.slice(0,limit));
                resolve(synonyms.slice(0,limit));
            } else {
                console.log(rsp.statusCode);
                resolve(console.log("Problems communicating with Thesaurus API"));
            }
        });
    });
    return thesaurusRequest;
}

var synonymRequest = function synonymRequest(target, limit){
    console.log(target);
    return getSynonyms(target, limit)
}

var multiSynonymRequest = function multiSynonymRequest(targets, limit){
    var curpromise=new Promise((resolve, reject)=>{
        []});
}

module.exports={
    synonymRequest: synonymRequest,
    multiSynonymRequest: multiSynonymRequest
}