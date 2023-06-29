const fs = require('fs')
const brain = require('brain.js')
const DictionaryService = require('./dictionary.js')
const config = {
    binaryThresh: 0.5,
    hiddenLayers: [20], // number of neurons in the hidden layer
    activation: 'sigmoid', // activation function for each neuron
    leakyReluAlpha: 0.01, // supported for activation type 'leaky-relu',
    learningRate: 0.1, // the learning rate for the network
};

const net = new brain.NeuralNetwork(config);

// give me data
const point_housenumbers = require('../data/point_housenumber.json')

let data = point_housenumbers.map(item => {
    return {
        input: item['addr:housenumber'],
        output: { housenumber:1 }
    }
})

// let data = [
//     { input: 'Quận 1', output: { district: 1 } },
// ]

function lower(str) {
    return str.toLowerCase()
}

// lower the data
data = data.map(item => {
    return {
        input: lower(item.input),
        output: item.output
    }
})


function firstTimeTrainAndRun() {
    const dictService = new DictionaryService(data, 'train')
    net.train(dictService.encodeTrainingSet())
    const networkState = JSON.stringify(net);
    fs.writeFile('./testAI/model.json', networkState, function (err) {
        if (err) throw err;
        console.log('Saved!');
    });
}

function loadAndKeepTraining(timesTrain) {
    const model = require('./model.json');
    net.fromJSON(model);
    const dictService = new DictionaryService(data, 'use')

    for (let i = 0; i < timesTrain; i++)
        net.train(dictService.encodeTrainingSet())

    let networkState = JSON.stringify(net.toJSON());
    fs.writeFile('./testAI/model.json', networkState, function (err) {
        if (err) throw err;
        console.log('Saved!');
    });
}

function loadAndRunTest(someString) {
    const model = require('./model.json');
    net.fromJSON(model);
    const dictService = new DictionaryService(data, 'use')
    let encode = dictService.encode(lower(someString), 'use')
    let a = net.run(encode)
    return a
}

function tokenizeString(someString) {
    let tokens = someString.split(' ')
    return tokens
}

function findDistrict(someString) {
    let district = ''
    someString = lower(someString)
    let initProbability = loadAndRunTest(someString)['district']
    console.log(initProbability)
    someString = tokenizeString(someString)
    // // idea is to find the longest string that is a district based on probability
    let i = 0
    let j = someString.length
    let iCanGo = true
    let jCanGo = true
    while (iCanGo || jCanGo) {
        console.log(i, j)
        if (i >= j)
            break
        let temp = someString.slice(i, j).join(' ')
        console.log(temp)
        let tempProbability = loadAndRunTest(temp)['district']
        console.log(tempProbability)
        if (tempProbability >= initProbability) {
            district = temp
            initProbability = tempProbability
            if (iCanGo)
                i++
            else if (jCanGo)
                j--
        }
        else {
            if (iCanGo) {
                iCanGo = false
                j--
                i--
            }
            else if (jCanGo) {
                jCanGo = false
            }
        }
    }

    return district
}
// firstTimeTrainAndRun()
// loadAndKeepTraining(10)

// let input = "cao xuan duc phuong 12 quan 8 tphcm"
// console.log(findDistrict(input))

let input = "822 "
let input1 = "cao xuan"
let input2 = "822 cao xuan"
let input3 = "822 cao xuan duc"
console.log(loadAndRunTest(input))
console.log(loadAndRunTest(input1))
console.log(loadAndRunTest(input2))
console.log(loadAndRunTest(input3))
