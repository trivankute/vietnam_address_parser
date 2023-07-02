var elasticsearch=require('elasticsearch');

var client = new elasticsearch.Client( {  
  hosts: [
    'http://trivan:trivan@localhost:9200',
  ]
});

module.exports = client;  
