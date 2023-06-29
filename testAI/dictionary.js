const fs = require('fs')
const dictionaryJSON = require('./dictionary.json')
class DictionaryService {

    // 'train'|'use'
    constructor(data, signal) {
        this.data = data
        if (signal == 'train')
            this.dictionary = this.buildWordDictionary(data, 'train')
        else
            this.dictionary = dictionaryJSON
    }

    // build dictionary of recognized words, based on the phrases inside the data file

    buildWordDictionary(trainingData, signal) {
        const tokenisedArray = trainingData.map(item => {
            const tokens = item.input.split(' ')
            return tokens
        })

        const flattenedArray = [].concat.apply([], tokenisedArray)
        if (signal === 'use')
            return flattenedArray.filter((item, pos, self) => self.indexOf(item) == pos)
        else {
            fs.writeFileSync('./testAI/dictionary.json', JSON.stringify(flattenedArray.filter((item, pos, self) => self.indexOf(item) == pos)))
            return flattenedArray.filter((item, pos, self) => self.indexOf(item) == pos)
        }
    }

    // encode strings to numbers
    encode(phrase, signal) {
        const phraseTokens = phrase.split(' ')
        const encodedPhrase = this.dictionary.map(word => {
            // count how many times the word appears in the phrase
            let count = 0;
            if (signal === 'use') {
                phraseTokens.forEach(token => {
                    if (token === word)
                        count++
                })
            }
            else
                count = phraseTokens.filter(token => token === word).length
            return count
        })

        if (signal === 'use') {
            // count those not exist
            let countNotExist = 0
            phraseTokens.forEach(token => {
                let exist = false
                for(let i = 0; i < this.dictionary.length; i++) {
                    if (token === this.dictionary[i]) {
                        exist = true
                        break
                    }
                }
                if (!exist)
                    countNotExist++
            })
            // push one more 0 for those not exist in dictionary
            if(countNotExist > 0)
                encodedPhrase.push(countNotExist)
            else
                encodedPhrase.push(0)
        }
        return encodedPhrase
    }

    // encode dataset for training

    encodeTrainingSet() {
        let dataEncoded = this.data.map(dataSet => {
            const encodedValue = this.encode(dataSet.input, 'train')
            // push one more 0 for those not exist in dictionary
            encodedValue.push(0)
            return { input: encodedValue, output: dataSet.output }
        })
        let lastElementInput = dataEncoded[0].input.map((item, index) => {
            // last is 1
            if (index == dataEncoded[0].input.length - 1)
                return 1
            else
                return 0
        })
        let lastElementOutput = {}
        this.data.forEach(item => {
            // get the key of item.output
            let key = Object.keys(item.output)[0]
            lastElementOutput[key] = -1
        })
        dataEncoded.push({ input: lastElementInput, output: lastElementOutput })
        return dataEncoded
    }
}

module.exports = DictionaryService