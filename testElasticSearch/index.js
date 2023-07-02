const Fuse = require("fuse.js")
var client = require('./connection.js');

async function createIndex(indexName) {
    client.indices.create({
        index: indexName
    }, function (err, resp, status) {
        if (err) {
            console.log(err);
        }
        else {
            console.log("create", resp);
        }
    });
}

async function showClusterHealth() {
    client.cluster.health({}, function (err, resp, status) {
        console.log("-- Client Health --", resp);
    });
}

async function showIndexsInfo(indexsArray) {
    for (let i = 0; i < indexsArray.length; i++) {
        await client.count({ index: indexsArray[i] }, function (err, resp, status) {
            console.log(resp);
        });
    }
}

async function showAllInfoDataOfIndex(indexName) {
    client.search({
        index: indexName,
        // type: 'constituencies',
        body: {
            query: {
                match_all: {}
            }
        }
    }, function (error, response, status) {
        if (error) {
            console.log("search error: " + error)
        }
        else {
            console.log("--- Response ---");
            console.log(response);
            console.log("--- Hits ---");
            response.hits.hits.forEach(function (hit) {
                console.log(hit);
            })
        }
    });
}

async function updateDataOfIndex(indexName, id, body) {
    // client.update({
    //     index: indexName,
    //     id: id,
    //     // body: {
    //     //     doc: body
    //     // }
    // }, function (err, resp, status) {
    //     console.log(resp);
    // });
    // client.indices.putMapping({
    //     index: indexName,
    //     body: body
    // }, function (err, resp, status) {
    //     console.log(resp);
    // });
}

async function deleteIndex(indexName) {
    client.indices.delete({ index: indexName }, function (err, resp, status) {
        console.log("delete", resp);
    });
}

async function addDataToIndex(indexName, id, body) {
    // index: 'gov',
    // id: '1',
    // body: {
    //   "ConstituencyName": "Ipswich",
    //   "ConstituencyID": "E14000761",
    //   "ConstituencyType": "Borough",
    //   "Electorate": 74499,
    //   "ValidVotes": 48694,
    // }
    client.index({
        index: indexName,
        // id: id,
        body: body
    }, function (err, resp, status) {
        console.log(resp);
    });
}

async function addDatasToIndex(bodyArray) {
    client.bulk({
        refresh: true,
        body: bodyArray
    }, function (err, resp, status) {
        console.log(resp);
    }
    );
}


async function deleteDataOfIndex(indexName, body) {
    // this is with id
    // client.delete({
    //     index: indexName,
    //     id: '1',
    // }, function (err, resp, status) {
    //     console.log(resp);
    // });

    // // this is with query
    // client.deleteByQuery({
    //     index: indexName,
    //     // id: '1',
    //     body: body
    // }, function (err, resp, status) {
    //     console.log(resp);
    // })
}

async function searchDataInIndex(indexName, query) {
    return new Promise((resolve, reject) => {
        client.search({
            index: indexName,
            body: query
        }, function (error, response, status) {
            if (error) {
                console.log("search error: " + error)
            }
            else {
                // console.log("--- Response ---");
                // console.log(response.hits);
                // console.log("--- Hits ---");
                // response.hits.hits.forEach(function (hit) {
                //     console.log(hit);
                // })
                // use get-json
                var json = response.hits.hits;
                json = JSON.stringify(response.hits.hits);
                json = JSON.parse(json);
                resolve(json)
            }
        });
    })

}
// createIndex('test')
// check index
// localhost:9200/_cat/shards?h=index,shards,state,prirep,unassigned.reason | grep UNASSIGNED
// showClusterHealth()
// deleteIndex('test')
// showIndexsInfo(['test'])
// showAllInfoDataOfIndex('test')
// updateDataOfIndex('test', '1', {
//     properties: {
//         "data": { "type": "text" }
//     }
// })
// deleteDataOfIndex('gov',
//     {
//         query: {
//             match: {
//                 street: "tung thien vuong"
//             }
//         }
//     }
// )

// let dataSet = [
//     {
//         "id":"1",
//         "data": "Trạm Xe Bus Rạp Đại Đồng, số 75 Cao Thắng, Phường 3 Quận 3"
//       }
// ]
// let bodyArray = []
// for (let i = 0; i < dataSet.length; i++) {
//     bodyArray.push({ index: { _index: 'test'} })
//     bodyArray.push(dataSet[i])
// }
// addDatasToIndex(bodyArray)

// searchDataInIndex('housenumber', {
//     query: {
//         match: {
//             housenumber: "103/4"
//         }
//     }
// }).then(res => {
//     console.log(res)
// })
//////////////////////////////////////////////////////////// version 1: các type phải đi theo cụm
async function addressParser(address) {
    // remove ',', '.',
    address = address.replace(/,/g, '')
    address = address.replace(/\./g, '')
    let stop = false
    let result = {
        "housename": "",
        "housenumber": "",
        "street": "",
        "ward": "",
        "district": "",
        "city": "Thành phố Hồ Chí Minh",
    }
    let signal = {
        "housename": false,
        "housenumber": false,
        "street": false,
        "ward": false,
        "district": false,
        "city": false,
    }
    while (!stop) {
        let addressTokens = address.split(' ')
        let housenameRes
        let housenumberRes
        let streetRes
        let wardRes
        let districtRes

        if (!signal.housename)
            housenameRes = await searchDataInIndex('housename', {
                query: {
                    match: {
                        housename: address
                    }
                }
            })

        if (!signal.housenumber)
            housenumberRes = await searchDataInIndex('housenumber', {
                query: {
                    match: {
                        housenumber: address
                    }
                }
            })

        if (!signal.street)
            streetRes = await searchDataInIndex('street', {
                query: {
                    match: {
                        street: address
                    }
                }
            })

        if (!signal.ward)
            wardRes = await searchDataInIndex('ward', {
                query: {
                    // match: {
                    //     ward: address
                    // }
                    // more score on this
                    function_score: {
                        query: {
                            match: {
                                ward: address
                            },
                        },
                        functions: [
                            {
                                filter: {
                                    match: {
                                        ward: address
                                    }
                                },
                                weight: 2
                            }
                        ],
                    },
                }
            })

        if (!signal.district)
            districtRes = await searchDataInIndex('district', {
                query: {
                    // match: {
                    //     district: address
                    // }
                    // more score on this
                    function_score: {
                        query: {
                            match: {
                                district: address
                            },
                        },
                        functions: [
                            {
                                filter: {
                                    match: {
                                        district: address
                                    }
                                },
                                weight: 2
                            }
                        ],
                    },
                }
            })

        let array = []
        // find max score
        if (!signal.district && districtRes.length > 0) {
            for (let i = 0; i < districtRes.length; i++) {
                array.push({
                    "type": "district",
                    "score": districtRes[i]._score,
                    "name": districtRes[i]._source.district
                })
            }
        }
        if (!signal.ward && wardRes.length > 0) {
            for (let i = 0; i < wardRes.length; i++) {
                array.push({
                    "type": "ward",
                    "score": wardRes[i]._score,
                    "name": wardRes[i]._source.ward
                })
            }
        }
        if (!signal.street && streetRes.length > 0) {
            for (let i = 0; i < streetRes.length; i++) {
                array.push({
                    "type": "street",
                    "score": streetRes[i]._score,
                    "name": streetRes[i]._source.street
                })
            }
        }
        if (!signal.housename && housenameRes.length > 0) {
            for (let i = 0; i < housenameRes.length; i++) {
                array.push({
                    "type": "housename",
                    "score": housenameRes[i]._score,
                    "name": housenameRes[i]._source.housename
                })
            }
        }
        if (!signal.housenumber && housenumberRes.length > 0) {
            for (let i = 0; i < housenumberRes.length; i++) {
                array.push({
                    "type": "housenumber",
                    "score": housenumberRes[i]._score,
                    "name": housenumberRes[i]._source.housenumber
                })
            }
        }

        // sort array
        array.sort(function (a, b) {
            return b.score - a.score;
        });
        /////////////////////////for check here
        // console.log(array)
        let target = [] // store start and end to cut addressTokens
        for (let i = 0; i < array.length; i++) {
            let length = array[i].name.split(' ').length
            for (let j = 0; j <= addressTokens.length - length; j++) {
                // string from j to j+length
                let string = addressTokens.slice(j, j + length).join(' ')
                // use fuse
                let fuse = new Fuse([string], {
                    includeScore: true,
                })
                let fuseRes = fuse.search(array[i].name)
                //////////////////////////////// for check here
                // console.log(string, array[i].type, array[i].name, fuseRes)
                if (fuseRes.length > 0 && fuseRes[0].score < 0.3) {
                    target.push({
                        "start": j,
                        "end": j + length,
                        "type": array[i].type,
                        "cutString": fuseRes[0].item,
                        "rightString": array[i].name
                    })
                    break
                }
            }
            if (target.length > 0)
                break
        }
        if (target.length > 0) {
            // update result
            // can change to rightString
            result[target[0].type] = target[0].cutString
            signal[target[0].type] = true
            // cut addressTokens
            addressTokens.splice(target[0].start, target[0].end - target[0].start)
        }
        // connect addressTokens
        let addressTokensString = addressTokens.join(' ')
        address = addressTokensString
        if (target.length == 0)
            stop = true
        if (addressTokens.length == 0)
            stop = true
        if (address === "")
            stop = true
    }


    // if target is nothing?
    return result
}
//////////////////////////////////////////////////////////// version 2: các type có thể tách chữ nằm bất kỳ đâu
async function addressParser2(address) {
    // remove ',', '.',
    address = address.replace(/,/g, '')
    address = address.replace(/\./g, '')
    let stop = false
    let result = {
        "housename": "",
        "housenumber": "",
        "street": "",
        "ward": "",
        "district": "",
        "city": "Thành phố Hồ Chí Minh",
    }
    let signal = {
        "housename": false,
        "housenumber": false,
        "street": false,
        "ward": false,
        "district": false,
        "city": false,
    }
    while (!stop) {
        let previousAddress = address
        let addressTokens = address.split(' ')
        let housenameRes
        let housenumberRes
        let streetRes
        let wardRes
        let districtRes
        if (!signal.housename)
            housenameRes = await searchDataInIndex('housename', {
                query: {
                    match: {
                        housename: address
                    }
                }
            })

        if (!signal.housenumber)
            housenumberRes = await searchDataInIndex('housenumber', {
                query: {
                    match: {
                        housenumber: address
                    }
                }
            })

        if (!signal.street)
            streetRes = await searchDataInIndex('street', {
                query: {
                    match: {
                        street: address
                    }
                }
            })

        if (!signal.ward)
            wardRes = await searchDataInIndex('ward', {
                query: {
                    // match: {
                    //     ward: address
                    // }
                    // more score on this
                    function_score: {
                        query: {
                            match: {
                                ward: address
                            },
                        },
                        functions: [
                            {
                                filter: {
                                    match: {
                                        ward: address
                                    }
                                },
                                weight: 15
                            }
                        ],
                    },
                }
            })

        if (!signal.district)
            districtRes = await searchDataInIndex('district', {
                query: {
                    // match: {
                    //     district: address
                    // }
                    // more score on this
                    function_score: {
                        query: {
                            match: {
                                district: address
                            },
                        },
                        functions: [
                            {
                                filter: {
                                    match: {
                                        district: address
                                    }
                                },
                                weight: 20
                            }
                        ],
                    },
                }
            })

        let array = []
        // find max score
        if (!signal.district && districtRes.length > 0) {
            for (let i = 0; i < districtRes.length; i++) {
                array.push({
                    "type": "district",
                    "score": districtRes[i]._score,
                    "name": districtRes[i]._source.district
                })
            }
        }
        if (!signal.ward && wardRes.length > 0) {
            for (let i = 0; i < wardRes.length; i++) {
                array.push({
                    "type": "ward",
                    "score": wardRes[i]._score,
                    "name": wardRes[i]._source.ward
                })
            }
        }
        if (!signal.street && streetRes.length > 0) {
            for (let i = 0; i < streetRes.length; i++) {
                array.push({
                    "type": "street",
                    "score": streetRes[i]._score,
                    "name": streetRes[i]._source.street
                })
            }
        }
        if (!signal.housename && housenameRes.length > 0) {
            for (let i = 0; i < housenameRes.length; i++) {
                array.push({
                    "type": "housename",
                    "score": housenameRes[i]._score,
                    "name": housenameRes[i]._source.housename
                })
            }
        }
        if (!signal.housenumber && housenumberRes.length > 0) {
            for (let i = 0; i < housenumberRes.length; i++) {
                array.push({
                    "type": "housenumber",
                    "score": housenumberRes[i]._score,
                    "name": housenumberRes[i]._source.housenumber
                })
            }
        }

        // sort array
        array.sort(function (a, b) {
            return b.score - a.score;
        });
        /////////////////////////for check here
        // console.log(array)
        for (let i = 0; i < array.length; i++) {
            let rightStringTokens = array[i].name.split(' ')
            let rightStringLength = rightStringTokens.length
            let fuseforRightStringTokens = new Fuse(rightStringTokens, {
                includeScore: true,
            })
            let targets = [] // store index to cut off
            for(let j=0; j<addressTokens.length; j++){
                let fuseRes = fuseforRightStringTokens.search(addressTokens[j])
                if (fuseRes.length > 0 && fuseRes[0].score < 0.3) {
                    targets.push({
                        "index": j,
                        "cutString": addressTokens[j],
                        "rightString": fuseRes[0].item,
                        "type": array[i].type
                    })
                    // cut off rightStringTokens
                    rightStringTokens.splice(fuseRes[0].refIndex, 1)
                    fuseforRightStringTokens = new Fuse(rightStringTokens, {
                        includeScore: true,
                    })
                }
            }
            // cut out addressTokens from largest to smallest in targets
            if (targets.length === rightStringLength) {
                targets.sort(function (a, b) {
                    return b.index - a.index;
                });
                // console.log(targets)
                for (let j = 0; j < targets.length; j++) {
                    addressTokens.splice(targets[j].index, 1)
                }
                // update result
                result[array[i].type] = array[i].name
                signal[array[i].type] = true
                // connect addressTokens
                address = addressTokens.join(' ')
                break;
            }

        }

        if (addressTokens.length == 0)
            stop = true
        if (address === "")
            stop = true
        if (previousAddress === address)
            stop = true
        // console.log(address)
    }
    return result
}
function forTest(test) {
    searchDataInIndex('housename', {
        query: {
            match: {
                housename: test
            }
            // function_score: {
            //     query: {
            //         match: {
            //             housenumber: test
            //         },
            //     },
            // functions: [
            //     {
            //         filter: {
            //             match_phrase: {
            //                 housenumber: test
            //             }
            //         },
            //         weight:2
            //     }
            // ],
            // },
        },
    }).then(res => {
        if (res.length > 0) {
            console.log("housename: ", res)
        }
        else
            console.log("housename: ", res)
    })

    searchDataInIndex('housenumber', {
        query: {
            match: {
                housenumber: test
            }
        }
    }).then(res => {
        if (res.length > 0) {
            console.log("housenumber: ", res)
        }
        else
            console.log("housenumber: ", res)
    })

    searchDataInIndex('street', {
        // if test include street increase score
        query: {
            match: {
                street: test
            }
            // function_score: {
            //     query: {
            //         match: {
            //             street: test
            //         },
            //     },
            //     functions: [
            //         {
            //             filter: {
            //                 match_phrase: {
            //                     street: "cao thắng"
            //                 }
            //             },
            //             weight:20
            //         }
            //     ],
            // },
        },
    }).then(res => {
        if (res.length > 0) {
            console.log("street: ", res)
        }
        else
            console.log("street: ", res)
    })


    searchDataInIndex('ward', {
        query: {
            match: {
                ward: test
            }
        }
    }).then(res => {
        if (res.length > 0) {
            console.log("ward: ", res)
        }
        else
            console.log("ward: ", res)
    })


    searchDataInIndex('district', {
        query: {
            match: {
                district: test
            }
        }
    }).then(res => {
        if (res.length > 0) {
            console.log("district: ", res)
        }
        else
            console.log("district: ", res)
    })
}

// addressParser('Trạm Xe Bus Rạp Đại Đồng, 75, Cao Thắng, Phường 3, Quận 3').then(res => {
//     console.log(res)
// })
// addressParser('75, Trạm Xe Bus Rạp Đại Đồng, Cao Thắng, Phường 3, Quận 3').then(res => {
//     console.log(res)
// })
// addressParser('Phường 3, 75, Trạm Xe Bus Rạp Đại Đồng, Cao Thắng, Quận 3').then(res => {
//     console.log(res)
// })
// addressParser('Phường 3, 75, Trạm Xe Bus Rạp Đại Đồng, Quận 3, Cao Thắng').then(res => {
//     console.log(res)
// })
//////////////////// 1 khi cái đầu đúng là trộn thế nào cũng thế
// addressParser("Đường Phùng Hưng, Phường 13 Quận 5").then(res => console.log(res))
// addressParser("90, Đường gò Công, Phường 13, Quận 5").then(res => console.log(res))
// addressParser("551, Đường bình đông, Phường 13, Quận 8").then(res => console.log(res))
// addressParser("Đường bình đông phường 13 quận 8").then(res => console.log(res))
// addressParser("103/4 đường cao xuân dục phường 12 quận 8").then(res => console.log(res))
// addressParser("hẻm 103 cao xuân dục quận 8").then(res => console.log(res))
// addressParser("103/4 cao xuân dục quận 8").then(res => console.log(res))
// addressParser("Bệnh viện xóm củi số nhà 895 cao xuân dục phường 12 quận 8").then(res => console.log(res))
// addressParser("Bệnh viện Tâm thần, 766, đường Võ Văn Kiệt, Phường 1, Quận 5").then(res => console.log(res))
// addressParser("Trường Đại học Bách khoa TP.HCM, 268, Lý Thường Kiệt, Phường 15, Quận 11,").then(res => console.log(res))
// addressParser("17 Dương thị mười Quận 12").then(res => console.log(res))
// addressParser("Đại Học Khoa học Tự Nhiên, 227, Nguyễn Văn Cừ, Phường 4, Quận 5").then(res => console.log(res))
// addressParser("cơm chay hòa hảo, 92, bàn cờ, Phuong 3, Quan 3").then(res => console.log(res))
// addressParser("92, cơm chay hòa hảo, bàn cờ, Phuong 3, Quan 3").then(res => console.log(res))
// addressParser("cơm chay hòa hảo, 92, Phuong 3, bàn cờ, Quan 3").then(res => console.log(res))
// addressParser("Quan 3, cơm chay hòa hảo, bàn cờ, Phuong 3, 92").then(res => console.log(res))
// addressParser("Quan, cơm 3 chay Phuong bàn hòa cờ, hảo, 3, 92").then(res => console.log(res))
// addressParser("Quan 3").then(res => console.log(res))
// addressParser("Phường Nguyễn Cư Trinh, Quận 1,").then(res => console.log(res))
// addressParser("Quận 1,").then(res => console.log(res))
// addressParser("227, Nguyễn Văn Cừ, Đại Học Khoa học Tự Nhiên, Phường 4, Quận 5").then(res => console.log(res))

// addressParser2("1 Quận").then(res => console.log(res))
// addressParser2("227, Nguyễn Văn Cừ, Đại Học Khoa học Tự Nhiên, Phường 4, Quận 5").then(res => console.log(res))
addressParser2("Quận, cơm 3 chay Phường bàn hòa cờ, hảo, 3, 92").then(res => console.log(res))
addressParser2("Trường học Bách Thường 15 khoa, Quận Đại 268, Lý TP.HCM Kiệt, Phường 11").then(res => console.log(res))
addressParser2("103/4 phường cao quận xuân dục 12 8").then(res => console.log(res))

// let test = "Trạm Xe Bus Rạp Đại Đồng, 75 Cao Thắng, Phường 3 Quận 3"
// let test = "Quận 3, 75 Cao Thắng, Trạm Xe Bus Rạp Đại Đồng, Phường 3 "
// let test = "Trạm Xe Bus Rạp Đại Đồng, 75 Cao Thắng, Quận 3"
// let test = "Trạm Xe Bus Rạp Đại Đồng Cao Thắng"
// let test = "Cao Thắng"
// let test = "tram xe bus rap dai dong, so 75 Cao Thang, Phuong 3 Quan 3"
// let test = "103/4 cao xuân dục phường 12 quận 8"
// let test = "cao xuân dục"
// let test = "hẻm 103 cao xuân dục phường 12 quận 8"
// let test = "hẻm 103 cao xuân dục phường 12"
// let test = "phường 12"
// let test = "hẻm 103 cao xuân dục"

// forTest('12 cao 103/4 xuân phường dục quận 8')
// forTest('Quan Phuong')
// forTest('Quan, cơm 3 chay Phuong bàn hòa cờ, hảo, 3, 92')

function randomLevenshteinCompare(testCaseString) {
    // split
    let testCaseTokens = testCaseString.split(' ')
    const testCaseTokensLength = testCaseTokens.length
    let fuseForTestCase = new Fuse(testCaseTokens, {
        includeScore: true,
    })
    let testArrayString = "Quan cơm 3 chay Phuong bàn hòa cờ hảo 3 92"
    let testArray = testArrayString.split(' ')
    let targets = [] // store index to cut off
    for (let i = 0; i < testArray.length; i++) {
        let fuseRes = fuseForTestCase.search(testArray[i])
        if (fuseRes.length > 0 && fuseRes[0].score < 0.4) {
            targets.push({
                "index": i,
                "cutString": testArray[i],
                "rightString": fuseRes[0].item,
            })
            // cut off testCaseTokens
            testCaseTokens.splice(fuseRes[0].refIndex, 1)
            fuseForTestCase = new Fuse(testCaseTokens, {
                includeScore: true,
            })
        }
    }
    // cut out testArray from largest to smallest in targets
    if (targets.length === testCaseTokensLength) {
        targets.sort(function (a, b) {
            return b.index - a.index;
        });
        console.log(targets)
        for (let i = 0; i < targets.length; i++) {
            testArray.splice(targets[i].index, 1)
        }
    }
    // console.log(testArray)
    // connect testArray
    address = testArray.join(' ')
    console.log(address)
}
// randomLevenshteinCompare('Cơm Chay Hòa Hảo')
// let testCase = ['Cơm']
// const fuseForTestCase = new Fuse(testCase, {
//     includeScore: true,
// })
// console.log(fuseForTestCase.search('Quan'))
// console.log(fuseForTestCase.search('Cao Xuân Dục'))
// console.log(fuseForTestCase.search('Hẻm 178 Cao Xuân Dục'))

// searchDataInIndex('test', {
//     query: {
//         // bool: {
//         //     must: {
//         //         match: { "data": "Cao thắng" }
//         //     }
//         // }
//         // bool: {
//         //     should:[
//         //         // {
//         //         //     match: { "data": "Đường đến trạm xe bus" }
//         //         // },
//         //     ],
//         // }
//     }
// }).then(res => {
//     if (res.length > 0) {
//         console.log("test: ", res)
//     }
//     else
//         console.log("test: ", res)
// })

// problem is using elastic search need time to merge data from postgis and observe data flow in elastic
