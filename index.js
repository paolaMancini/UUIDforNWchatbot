const request = require("request")
const fs = require('fs');
const pathFS = require('path');
const util = require('util');


let host = "xxx.xxx.xxx.xxx:8080" ;




if ( process.argv.length > 2 ){

    host = process.argv[2];
}




let url = "http://"+host+"/netwrapper-etl/api/v1/topology/config"


let options = {
    httpproxy: process.env.http_proxy
    , httpsproxy: process.env.http_proxy
    , noproxy: process.env.no_proxy
    , url: url
    , json: true
};


request(options, function (error, response, body) {

    let result = {
        success: false


    };

    let cdnLib = null;



    if (response && response.statusCode === 200) {




        result = {
            success: true,
            data: body
        };

    }
    else {
        result = {
            success: false,
            error: error,
            response: response

        };

    }
    let configurations = result.data;
    
    let newConfigurations = [];

    let formattedDate = new Date().toLocaleString();
    let newResponse = {
           url: options.url     ,
           timestamp:formattedDate,
           configurations : newConfigurations 


    }
    configurations.forEach(function (configuration) {
        
        let topology = configuration.topology ;

        //console.log(textJson);
        let resultNew = {
            configurationName: configuration.name
            ,configurationUUID: configuration.UUID 
            ,topology:{
                 topologyUUID:   topology.UUID,
                 links:[]
            }
        };
        newConfigurations.push(resultNew);
        topology.links.forEach(function (link) {
                let linkNew = {
                     name: link.name   
                    ,linkUUID:link.UUID
                    ,externalLinks:[]
                };
                resultNew.topology.links.push(linkNew);
                link.serviceNodeLinks.forEach(function (serviceNodeLink) {
                    let probeID ;
                    if (serviceNodeLink.externalSystemEntities.length > 0 ){
                            probeID =serviceNodeLink.externalSystemEntities[0].externalSourceID
                    }
                    linkNew.externalLinks.push({
                         serviceLinkserviceType : serviceNodeLink.suppliedByCUCM ? "CUCM" : "SKYPE4B", 
                         serviceLinkUUID:serviceNodeLink.UUID ,
                         serviceLinkname :   serviceNodeLink.name,
                         serviceLinkinternalUUID:serviceNodeLink.internalUUID,
                         serviceLinkprobesLINKUUID : probeID
                    })
                   // console.log(util.inspect(serviceNodeLink.externalSystemEntities, false,2));
                });
                link.networkNodeLinks.forEach(function (networkNodeLink) {
                    let probeID ;
                    if (networkNodeLink.externalSystemEntities.length > 0 ){
                            probeID =networkNodeLink.externalSystemEntities[0].externalSourceID
                    }
                    linkNew.externalLinks.push({
                        networkLinkType : networkNodeLink.suppliedByAPICEM ? "APICEM" : "SKYPE4B", 
                         networkLinkUUID:networkNodeLink.UUID ,
                         networkLinkname :   networkNodeLink.name,
                         networkLinkinternalUUID:networkNodeLink.internalUUID,
                         networkLinkprobesLINKUUID : probeID
                         
                    })
                });

              //console.log(util.inspect(link, false,2));
        });
        
        
    });
    console.log( JSON.stringify(newResponse, null, 4) );

});