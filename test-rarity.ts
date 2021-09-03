import "@nomiclabs/hardhat-waffle";
import {ethers} from "hardhat";
import * as fs from "fs";

async function main() {
  const [owner] = await ethers.getSigners();
  const TestGotchi = await ethers.getContractFactory("TestGotchi");
  const testGotchi = await TestGotchi.deploy();

  const simCount: number = 100000;

  const h1stream = fs.createWriteStream('./haunt1.csv');
  const h2stream = fs.createWriteStream('./haunt2.csv');
  h1stream.write("t1,t2,t3,t4,t5,t6,brs");
  h2stream.write("t1,t2,t3,t4,t5,t6,brs")
  h1stream.on('error', function(err) { console.log('Error in writing') });
  h2stream.on('error', function(err) { console.log('Error in writing') });

  function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  console.log("Haunt 1 simulation starting");
  for(let i = 0; i < simCount; i++) {
    const traits: (number)[] = await testGotchi.toNumericTraits(i, [0, 0, 0, 0, 0, 0], 1);
    let brs = 0;
    for(let j = 0; j < 6; j++) {
      const trait = traits[j];
      h1stream.write(String(trait) + ',');
      if (trait < 50) {
        brs += 100 - trait;
      }
      else {
        brs += trait + 1;
      }
    }
    h1stream.write(String(brs) + '\n');
  }
  h1stream.end();
  console.log("Haunt 1 simulation complete");

  console.log("Haunt 2 simulation starting");
  for(let i = 0; i < simCount; i++) {
    const traits: (number)[] = await testGotchi.toNumericTraits(i, [0, 0, 0, 0, 0, 0], 2);
    let brs = 0;
    for(let j = 0; j < 6; j++) {
      const trait = traits[j];
      h2stream.write(String(trait) + ',');
      if (trait < 50) {
        brs += 100 - trait;
      }
      else {
        brs += trait + 1;
      }
    }
    h2stream.write(String(brs) + '\n');
  }

  console.log("Haunt 2 simulation complete");
  h2stream.end();
  //Wait for the files to finish writing
  await delay(10000 + simCount);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
