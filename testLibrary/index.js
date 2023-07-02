
const { spawn } = require('child_process')

const expandAddress = (address) => {
  let addresses = []
  const childProcess = spawn('D:\\ThucTap\\testAddressParser\\testLibrary\\libpostal.exe', ["--json", address]);
  childProcess.stdout.on('data', (data) => {
    // data is buffer
    let str = data.toString()
    let json = JSON.parse(str)
    console.log(json)
  });
  // handle stderr data
  childProcess.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });
  // handle process exit
  childProcess.on('exit', (code) => {
    console.log(`Child process exited with code ${code}`);
  });
}

const addressParser = (address) => {
    // use spawn
    const childProcess = spawn('D:\\ThucTap\\testAddressParser\\testLibrary\\address_parser.exe');
    // handle stdout data
    childProcess.stdout.on('data', (data) => {
      // data is buffer
      let str = data.toString()
      if(str.includes("Result:"))
      {
        // cut from {
        str = str.substring(str.indexOf("{"))
        // cut to }
        str = str.substring(0, str.indexOf("}") + 1)
        // parse to json
        let json = JSON.parse(str)
        console.log(json)
      }
    });
    // handle stderr data
    childProcess.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    });
    // handle process exit
    childProcess.on('exit', (code) => {
      console.log(`Child process exited with code ${code}`);
    });
    // provide input
    childProcess.stdin.write(`${address}\n`);
    // end
    childProcess.stdin.end();
  };

  // expandAddress("truong thcs tung thien vuong, hem 369 tung thien vuong, p12 q8 thanh pho ho chi minh");
// addressParser("phường 12, quận 8");
  
  
  
  
