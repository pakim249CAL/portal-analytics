import * as fs from "fs";
const {default:axios} = require('axios');

function delay(ms: number) {
  return new Promise( resolve => setTimeout(resolve, ms) );
}

const PortalGraphQuery = (haunt: number, status: String, last_id: String) => {
    let query = `{
      portals(
        first: 1000,
        where: { id_gt: "${last_id}", status: ${status}, hauntId: "${haunt}" }
      ) {
        id
        hauntId
        status,
        options {
          id
          baseRarityScore
          numericTraits
          minimumStake
          collateralType
        }
      }
    }`;
  
    return query;
  }

export const retrievePortals = async (hauntid: number, status: String) => {
  let portals = [];
  let morePortals = true;
  let last_id: String = "";
  for (let i = 0; i < 10 && morePortals; i++) {
    
    const p = await axios.post(
      'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
      {
        query: PortalGraphQuery(hauntid, status, last_id)
      }
    );
    if (p.data.data.portals.length > 0) {
      portals.push(...p.data.data.portals);
      last_id = portals[portals.length - 1].id;
    } else {
      morePortals = false;
    }
  }

  return portals;
};


async function main() {
  const h1stream = fs.createWriteStream('./haunt1portals.csv');
  const h2stream = fs.createWriteStream('./haunt2portals.csv');
  h1stream.write("t1,t2,t3,t4,t5,t6,brs\n");
  h2stream.write("t1,t2,t3,t4,t5,t6,brs\n");

  let h1portals = await retrievePortals(1, "Opened");
  let h1portalsClaimed = await retrievePortals(1, "Claimed");
  console.log(h1portals.length);
  console.log(h1portalsClaimed.length);
  h1portals = h1portals.concat(h1portalsClaimed);

  let h2portals = await retrievePortals(2, "Opened");
  let h2portalsClaimed = await retrievePortals(2, "Claimed");
  console.log(h2portals.length);
  console.log(h2portalsClaimed.length);
  h2portals = h2portals.concat(h2portalsClaimed);


  for(let i = 0; i < h1portals.length; i++) {
    for(let j = 0; j < 10; j++) {
      for(let k = 0; k < 6; k++) {
        h1stream.write(String(h1portals[i].options[j].numericTraits[k]) + ',');
      }
      h1stream.write(String(h1portals[i].options[j].baseRarityScore) + '\n');
    }
  }

  for(let i = 0; i < h2portals.length; i++) {
    for(let j = 0; j < 10; j++) {
      for(let k = 0; k < 6; k++) {
        h2stream.write(String(h2portals[i].options[j].numericTraits[k]) + ',');
      }
      h2stream.write(String(h2portals[i].options[j].baseRarityScore) + '\n');
    }
  }
  h1stream.end();
  h2stream.end();
  await delay(3000);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

