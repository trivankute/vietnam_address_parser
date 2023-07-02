const Fuse = require('fuse.js')

const books = [
    {
      title: "Old Man's War",
      author: {
        firstName: 'John',
        lastName: 'Scalzi'
      }
    },
    {
      title: 'The Lock Artist',
      author: {
        firstName: 'Steve',
        lastName: 'Hamilton'
      }
    }
  ]
  // 2. Set up the Fuse instance
  const fuse = new Fuse(books, {
    keys: ['title', 'author.firstName'],
    includeScore:true,
    threshold: 0.6,
  })
  
  // 3. Now search!
 console.log(fuse.search('jon'))
 console.log(fuse.search('old man'))
  